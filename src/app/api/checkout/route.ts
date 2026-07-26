import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'
import { generateIntegritySignature } from '@/lib/wompi'
import { verifyCsrf } from '@/lib/csrf'
import { getRateLimitKey, checkRateLimit } from '@/lib/rate-limit'
import { logger, generateRequestId } from '@/lib/logger'
import { sanitizeShipping } from '@/lib/sanitize'
import type { CartItem } from '@/features/tienda/types'

interface CheckoutRequest {
  shipping: {
    nombre: string
    email: string
    telefono: string
    direccion: string
    departamento: string
    ciudad: string
    barrio: string
    notas: string
  }
  items: CartItem[]
}

function generateOrderNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'PM-'
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: NextRequest) {
  const rid = generateRequestId()
  const start = Date.now()
  const cookieChanges: { name: string; value: string; options: Record<string, unknown> }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieChanges.push({ name, value, options: options as Record<string, unknown> })
          })
        },
      },
    },
  )

  function respond(data: unknown, init?: ResponseInit) {
    const res = NextResponse.json(data, init)
    cookieChanges.forEach(({ name, value, options }) => {
      res.cookies.set(name, value, options as Parameters<typeof res.cookies.set>[2])
    })
    return res
  }

  try {
    logger.info('Checkout iniciado', { requestId: rid })

    if (!verifyCsrf(request)) {
      logger.warn('Checkout: CSRF inválido', { requestId: rid })
      return respond({ error: 'Origen no autorizado' }, { status: 403 })
    }

    const rl = checkRateLimit(getRateLimitKey(request))
    if (!rl.allowed) {
      logger.warn('Checkout: rate limit excedido', { requestId: rid })
      return respond(
        { error: 'Demasiadas solicitudes. Intentá de nuevo en un minuto.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetTime - Date.now()) / 1000)) } },
      )
    }

    const body: CheckoutRequest = await request.json()
    const { shipping: rawShipping, items } = body

    if (!rawShipping || !items || items.length === 0) {
      return respond(
        { error: 'Datos de envío y artículos requeridos' },
        { status: 400 },
      )
    }

    const MAX_ITEMS = 50
    if (items.length > MAX_ITEMS) {
      logger.warn('Checkout: límite de items excedido', { requestId: rid, data: { count: items.length, max: MAX_ITEMS } })
      return respond(
        { error: `Máximo ${MAX_ITEMS} artículos por pedido` },
        { status: 400 },
      )
    }

    if (!rawShipping.nombre || !rawShipping.email || !rawShipping.telefono || !rawShipping.direccion || !rawShipping.departamento || !rawShipping.ciudad) {
      return respond(
        { error: 'Completa todos los campos del formulario' },
        { status: 400 },
      )
    }

    const shipping = sanitizeShipping(rawShipping)

    const { data: { user } } = await supabase.auth.getUser()

    let orderNumber: string
    let attempts = 0

    do {
      orderNumber = generateOrderNumber()
      const { data: existing } = await supabase
        .from('pedidos')
        .select('id')
        .eq('numero_pedido', orderNumber)
        .maybeSingle()

      if (!existing) break
      attempts++
    } while (attempts < 5)

    if (attempts >= 5) {
      return respond(
        { error: 'Error generando número de pedido. Intentá de nuevo.' },
        { status: 500 },
      )
    }

    // 1. Verificar stock y obtener precios reales desde DB
    const productPrices = new Map<string, number>()

    for (const item of items) {
      const { data: product, error: productError } = await supabase
        .from('productos')
        .select('id, stock, precio')
        .eq('id', item.id)
        .single()

      if (productError || !product) {
        return respond(
          { error: `Producto no encontrado: ${item.nombre}` },
          { status: 404 },
        )
      }

      if (item.variantId) {
        const { data: variant, error: variantError } = await supabase
          .from('producto_variantes')
          .select('stock')
          .eq('id', item.variantId)
          .eq('producto_id', item.id)
          .single()

        if (variantError || !variant) {
          return respond(
            { error: `Variante no encontrada para: ${item.nombre}` },
            { status: 404 },
          )
        }

        if (variant.stock < item.cantidad) {
          return respond(
            { error: `Stock insuficiente para: ${item.nombre}` },
            { status: 409 },
          )
        }
      } else {
        if (product.stock < item.cantidad) {
          return respond(
            { error: `Stock insuficiente para: ${item.nombre}` },
            { status: 409 },
          )
        }
      }

      productPrices.set(item.id, product.precio)
    }

    const total = items.reduce(
      (sum, item) => sum + (productPrices.get(item.id) ?? 0) * item.cantidad,
      0,
    )

    // 2. Insertar pedido
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        usuario_id: user?.id ?? null,
        numero_pedido: orderNumber,
        nombre_entrega: shipping.nombre,
        email: shipping.email,
        telefono: shipping.telefono,
        direccion: shipping.direccion,
        departamento: shipping.departamento,
        ciudad: shipping.ciudad,
        barrio: shipping.barrio,
        notas: shipping.notas,
        total,
        estado: 'pendiente',
      })
      .select('id, numero_pedido, created_at')
      .single()

    if (pedidoError || !pedido) {
      console.error('Insert pedido error:', pedidoError)
      return respond(
        { error: 'Error al crear el pedido' },
        { status: 500 },
      )
    }

    // 4. Insertar items del pedido
    const pedidoItems = items.map((item) => ({
      pedido_id: pedido.id,
      producto_id: item.id,
      variante_id: item.variantId ?? null,
      nombre: item.nombre,
      precio: productPrices.get(item.id) ?? 0,
      talla: item.tallaSeleccionada,
      color: item.colorSeleccionado,
      cantidad: item.cantidad,
      imagen_url: item.imagenes[0]?.url ?? null,
    }))

    const { error: itemsError } = await supabase
      .from('pedido_items')
      .insert(pedidoItems)

    if (itemsError) {
      console.error('Insert pedido_items error:', itemsError)
      await supabase.from('pedidos').delete().eq('id', pedido.id)
      return respond(
        { error: 'Error al guardar los artículos del pedido' },
        { status: 500 },
      )
    }

    // 5. Generar params para Wompi Widget
    const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY
    const integrityKey = process.env.WOMPI_INTEGRITY_KEY
    const amountInCents = Math.round(total * 100)

    if (!publicKey || !integrityKey) {
      console.error('Faltan llaves de Wompi en .env.local')
      await supabase.from('pedido_items').delete().eq('pedido_id', pedido.id)
      await supabase.from('pedidos').delete().eq('id', pedido.id)
      return respond(
        { error: 'Error de configuración de pago. Contactá al administrador.' },
        { status: 500 },
      )
    }

    const signature = generateIntegritySignature(
      orderNumber,
      amountInCents,
      'COP',
      integrityKey,
    )

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://punkmedallo.com'
    const isLocal = siteUrl.startsWith('http://localhost') || siteUrl.startsWith('http://127.0.0.1')
    const redirectUrl = isLocal ? '' : `${siteUrl}/tienda/compra`

    logger.info('Pedido creado exitosamente', {
      requestId: rid,
      duration: Date.now() - start,
      data: { orderNumber, total, itemsCount: items.length },
    })

    return respond(
      {
        numero_pedido: orderNumber,
        pedido_id: pedido.id,
        wompi: {
          publicKey,
          amountInCents,
          currency: 'COP',
          reference: orderNumber,
          signature: { integrity: signature },
          redirectUrl,
        },
      },
      { status: 201 },
    )
  } catch (err) {
    logger.error('Error en checkout', { requestId: rid, error: err, duration: Date.now() - start })
    return respond(
      { error: 'Error interno del servidor' },
      { status: 500 },
    )
  }
}

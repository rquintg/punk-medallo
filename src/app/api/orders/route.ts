import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { sendOrderConfirmation } from '@/lib/email'
import { verifyCsrf } from '@/lib/csrf'
import { getRateLimitKey, checkRateLimit } from '@/lib/rate-limit'
import { logger, generateRequestId } from '@/lib/logger'
import type { CartItem } from '@/features/tienda/types'

interface OrderRequest {
  shipping: {
    nombre: string
    email: string
    telefono: string
    direccion: string
    ciudad: string
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

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false },
  },
)

export async function POST(request: NextRequest) {
  const rid = generateRequestId()
  const start = Date.now()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {},
      },
    },
  )

  try {
    logger.info('Orders iniciado', { requestId: rid })

    if (!verifyCsrf(request)) {
      logger.warn('Orders: CSRF inválido', { requestId: rid })
      return NextResponse.json({ error: 'Origen no autorizado' }, { status: 403 })
    }

    const rl = checkRateLimit(getRateLimitKey(request))
    if (!rl.allowed) {
      logger.warn('Orders: rate limit excedido', { requestId: rid })
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intentá de nuevo en un minuto.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetTime - Date.now()) / 1000)) } },
      )
    }

    const body: OrderRequest = await request.json()
    const { shipping, items } = body

    if (!shipping || !items || items.length === 0 || !shipping.nombre || !shipping.email) {
      return NextResponse.json(
        { error: 'Datos de envío y artículos requeridos' },
        { status: 400 },
      )
    }

    const total = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
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
      return NextResponse.json(
        { error: 'Error generando número de pedido. Intentá de nuevo.' },
        { status: 500 },
      )
    }

    // 1. Verificar stock de TODOS los items antes de insertar nada
    const insufficientStock: string[] = []
    const stockUpdates: { id: string; variantId?: string | null; nuevoStock: number; productId: string }[] = []

    for (const item of items) {
      if (item.variantId) {
        const { data: variant, error: variantError } = await supabaseAdmin
          .from('producto_variantes')
          .select('stock')
          .eq('id', item.variantId)
          .eq('producto_id', item.id)
          .single()

        if (variantError || !variant) {
          return NextResponse.json(
            { error: `Variante no encontrada: ${item.nombre}` },
            { status: 404 },
          )
        }

        if (variant.stock < item.cantidad) {
          insufficientStock.push(item.nombre)
        } else {
          stockUpdates.push({ id: item.variantId, variantId: item.variantId, nuevoStock: variant.stock - item.cantidad, productId: item.id })
        }
      } else {
        const { data: product, error: productError } = await supabaseAdmin
          .from('productos')
          .select('id, stock')
          .eq('id', item.id)
          .single()

        if (productError || !product) {
          return NextResponse.json(
            { error: `Producto no encontrado: ${item.nombre}` },
            { status: 404 },
          )
        }

        if (product.stock < item.cantidad) {
          insufficientStock.push(item.nombre)
        } else {
          stockUpdates.push({ id: item.id, nuevoStock: product.stock - item.cantidad, productId: item.id })
        }
      }
    }

    if (insufficientStock.length > 0) {
      return NextResponse.json(
        { error: `Stock insuficiente para: ${insufficientStock.join(', ')}` },
        { status: 409 },
      )
    }

    // 2. Descontar stock (con service_role, bypass RLS)
    for (const update of stockUpdates) {
      if (update.variantId) {
        const { error: updateError } = await supabaseAdmin
          .from('producto_variantes')
          .update({ stock: update.nuevoStock })
          .eq('id', update.id)

        if (updateError) {
          logger.error('Error descontando stock de variante', { requestId: rid, data: { variantId: update.id, error: updateError } })
          return NextResponse.json(
            { error: 'Error al actualizar el stock. Intentá de nuevo.' },
            { status: 500 },
          )
        }
      } else {
        const { error: updateError } = await supabaseAdmin
          .from('productos')
          .update({ stock: update.nuevoStock })
          .eq('id', update.id)

        if (updateError) {
          logger.error('Error descontando stock de producto', { requestId: rid, data: { productId: update.id, error: updateError } })
          return NextResponse.json(
            { error: 'Error al actualizar el stock. Intentá de nuevo.' },
            { status: 500 },
          )
        }
      }
    }

    // 3. Insertar pedido
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        usuario_id: user?.id ?? null,
        numero_pedido: orderNumber,
        nombre_entrega: shipping.nombre,
        email: shipping.email,
        telefono: shipping.telefono,
        direccion: shipping.direccion,
        ciudad: shipping.ciudad,
        total,
        estado: 'pendiente',
      })
      .select('id, numero_pedido, created_at')
      .single()

    if (pedidoError || !pedido) {
      console.error('Insert pedido error:', pedidoError)

      // Rollback: restaurar stock
      for (const update of stockUpdates) {
        const cantidad = items.find((i) => i.id === update.productId)?.cantidad ?? 0
        const table = update.variantId ? 'producto_variantes' : 'productos'
        await supabaseAdmin
          .from(table)
          .update({ stock: update.nuevoStock + cantidad })
          .eq('id', update.id)
      }

      return NextResponse.json(
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
      precio: item.precio,
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

      // Rollback: restaurar stock + borrar pedido
      for (const update of stockUpdates) {
        const cantidad = items.find((i) => i.id === update.productId)?.cantidad ?? 0
        const table = update.variantId ? 'producto_variantes' : 'productos'
        await supabaseAdmin
          .from(table)
          .update({ stock: update.nuevoStock + cantidad })
          .eq('id', update.id)
      }

      await supabase.from('pedidos').delete().eq('id', pedido.id)

      return NextResponse.json(
        { error: 'Error al guardar los artículos del pedido' },
        { status: 500 },
      )
    }

    // 5. Enviar email (no crítico — si falla, el pedido ya existe)
    const estimatedDelivery = addDays(new Date(), 5)

    sendOrderConfirmation({
      orderNumber,
      customerName: shipping.nombre,
      email: shipping.email,
      phone: shipping.telefono,
      address: shipping.direccion,
      city: shipping.ciudad,
      items: items.map((item) => ({
        name: item.nombre,
        quantity: item.cantidad,
        price: item.precio,
        size: item.tallaSeleccionada,
        color: item.colorSeleccionado,
        imageUrl: item.imagenes[0]?.url ?? null,
      })),
      total,
      estimatedDelivery: estimatedDelivery.toLocaleDateString('es-CO', {
        dateStyle: 'long',
      }),
    })

    return NextResponse.json(
      {
        order: {
          id: pedido.id,
          numero_pedido: orderNumber,
          total,
          estimatedDelivery: estimatedDelivery.toISOString(),
          created_at: pedido.created_at,
        },
      },
      { status: 201 },
    )
  } catch (err) {
    logger.error('Error en orders', { requestId: rid, error: err, duration: Date.now() - start })
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    )
  }
}

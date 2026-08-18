import { NextResponse, type NextRequest } from 'next/server'
import { randomInt } from 'node:crypto'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { generateIntegritySignature } from '@/lib/wompi'
import { verifyCsrf } from '@/lib/csrf'
import { getRateLimitKey, checkRateLimit } from '@/lib/rate-limit'
import { logger, generateRequestId } from '@/lib/logger'
import { firmarPedido, ORDER_VERIFY_COOKIE } from '@/lib/order-verify'
import { sanitizeShipping } from '@/lib/sanitize'
import { calcularEnvio, getDiasEntrega, esContraEntregaDisponible, calcularRecargoContraEntrega } from '@/data/envio'
import { sendOrderConfirmation } from '@/lib/email'
import { precioConDescuento } from '@/lib/precio'
import { MAX_QUANTITY } from '@/features/tienda/constants'
import type { CartItem } from '@/features/tienda/types'
import { validarCupon, consumirCupon, liberarCupon, registrarRedencion } from '@/features/cupones/services/cupones'
import { calcularDescuento, normalizarCodigo } from '@/features/cupones/calculo'

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
    aceptaPoliticas?: boolean
  }
  items: CartItem[]
  metodoPago?: 'wompi' | 'contra_entrega'
  cuponCodigo?: string
}

function generateOrderNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'PM-'
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(randomInt(chars.length))
  }
  return result
}

export async function POST(request: NextRequest) {
  const rid = generateRequestId()
  const start = Date.now()
  const cookieChanges: { name: string; value: string; options: CookieOptions }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieChanges.push({ name, value, options })
          })
        },
      },
    },
  )

  function respond(data: unknown, init?: ResponseInit) {
    const res = NextResponse.json(data, init)
    cookieChanges.forEach(({ name, value, options }) => {
      res.cookies.set(name, value, options)
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

    // Validación de cantidad: entero 1..MAX_QUANTITY (el cliente ya lo limita;
    // esto es la autoridad server — cantidad 0/negativa/float sortearía el stock)
    for (const item of items) {
      if (!Number.isInteger(item.cantidad) || item.cantidad < 1 || item.cantidad > MAX_QUANTITY) {
        logger.warn('Checkout: cantidad inválida', { requestId: rid, data: { producto: item.id, cantidad: item.cantidad } })
        return respond(
          { error: `Cantidad inválida para: ${item.nombre}` },
          { status: 400 },
        )
      }
    }

    // Dedupe defensivo: mismo id+variantId se suma (el cliente ya mergea; acá se
    // evita que líneas duplicadas inflen el pedido o burlen el check de stock)
    const merged = new Map<string, CartItem>()
    for (const item of items) {
      const key = `${item.id}::${item.variantId ?? ''}`
      const prev = merged.get(key)
      if (prev) {
        prev.cantidad += item.cantidad
      } else {
        merged.set(key, { ...item })
      }
    }
    const itemsFinal = [...merged.values()]
    for (const item of itemsFinal) {
      if (item.cantidad > MAX_QUANTITY) {
        return respond(
          { error: `Cantidad inválida para: ${item.nombre}` },
          { status: 400 },
        )
      }
    }

    if (!rawShipping.nombre || !rawShipping.email || !rawShipping.telefono || !rawShipping.direccion || !rawShipping.departamento || !rawShipping.ciudad) {
      return respond(
        { error: 'Completa todos los campos del formulario' },
        { status: 400 },
      )
    }

    if (rawShipping.aceptaPoliticas !== true) {
      logger.warn('Checkout: políticas no aceptadas', { requestId: rid })
      return respond(
        { error: 'Debes aceptar las políticas de cambios y privacidad' },
        { status: 400 },
      )
    }

    const shipping = sanitizeShipping(rawShipping)

    // Método de pago: wompi (default) o contra entrega (solo Medellín y AM)
    const esCOD = body.metodoPago === 'contra_entrega'

    if (esCOD && !esContraEntregaDisponible(shipping.departamento, shipping.ciudad)) {
      logger.warn('Checkout: contra entrega no disponible', { requestId: rid, data: { departamento: shipping.departamento, ciudad: shipping.ciudad } })
      return respond(
        { error: 'Pago contra entrega solo disponible en Medellín y área metropolitana' },
        { status: 400 },
      )
    }

    const recargo = esCOD
      ? calcularRecargoContraEntrega(shipping.departamento, shipping.ciudad)
      : 0

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

    // 1. Verificar stock y obtener precios reales desde DB (batch queries)
    const productIds = itemsFinal.map((i) => i.id)
    const { data: products, error: productsError } = await supabase
      .from('productos')
      .select('id, stock, precio, descuento')
      .in('id', productIds)

    if (productsError || !products) {
      return respond(
        { error: 'Error verificando productos' },
        { status: 500 },
      )
    }

    const productMap = new Map(products.map((p) => [p.id, p]))
    const variantIds = itemsFinal.filter((i) => i.variantId).map((i) => i.variantId!)
    let variantMap = new Map<string, { id: string; producto_id: string; stock: number }>()

    if (variantIds.length > 0) {
      const { data: variants, error: variantsError } = await supabase
        .from('producto_variantes')
        .select('id, producto_id, stock')
        .in('id', variantIds)

      if (variantsError) {
        return respond(
          { error: 'Error verificando variantes' },
          { status: 500 },
        )
      }

      variantMap = new Map((variants ?? []).map((v) => [v.id, v]))
    }

    const productPrices = new Map<string, number>()

    for (const item of itemsFinal) {
      const product = productMap.get(item.id)

      if (!product) {
        return respond(
          { error: `Producto no encontrado: ${item.nombre}` },
          { status: 404 },
        )
      }

      if (item.variantId) {
        const variant = variantMap.get(item.variantId)

        if (!variant || variant.producto_id !== item.id) {
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

      productPrices.set(item.id, precioConDescuento(product.precio, product.descuento))
    }

    const total = itemsFinal.reduce(
      (sum, item) => sum + (productPrices.get(item.id) ?? 0) * item.cantidad,
      0,
    )

    // Envío: tarifa por zona (server-side, no confiar en el cliente) + gratis > umbral
    const envio = calcularEnvio(total, shipping.departamento)

    // 1.5. Cupón: validar, reservar cupo (atómico) y calcular descuento
    let cuponInfo: {
      id: string
      codigo: string
      tipo: string
      valor: number
      descuento_maximo: number | null
    } | null = null
    let descuento = 0

    const cuponCodigo = body.cuponCodigo ? normalizarCodigo(body.cuponCodigo) : null
    if (cuponCodigo) {
      const validacion = await validarCupon(supabase, cuponCodigo, shipping.email, total)

      if (!validacion.valido) {
        logger.warn('Checkout: cupón inválido', { requestId: rid, data: { codigo: cuponCodigo, motivo: validacion.motivo } })
        return respond(
          { error: validacion.motivo === 'ya_usado'
            ? 'Ya usaste este cupón con ese correo'
            : validacion.motivo === 'minimo'
              ? 'Este cupón requiere un pedido mínimo'
              : 'El cupón no es válido para este pedido' },
          { status: 400 },
        )
      }

      cuponInfo = validacion.cupon!

      const reservado = await consumirCupon(cuponInfo.id)
      if (!reservado.ok) {
        if (reservado.errorMessage) {
          logger.error('Checkout: error RPC consumir cupón', {
            requestId: rid,
            data: { codigo: cuponCodigo, error: reservado.errorMessage },
          })
          return respond(
            { error: 'No se pudo aplicar el cupón. Intentá de nuevo.' },
            { status: 500 },
          )
        }
        logger.warn('Checkout: cupón sin cupo', { requestId: rid, data: { codigo: cuponCodigo } })
        return respond(
          { error: 'El cupón agotó su cupo de usos' },
          { status: 400 },
        )
      }

      descuento =
        cuponInfo.tipo === 'envio'
          ? envio
          : calcularDescuento(
              cuponInfo.tipo as 'porcentaje' | 'fijo',
              cuponInfo.valor,
              cuponInfo.descuento_maximo,
              total,
            )
    }

    const totalConDescuento = total + envio + recargo - descuento

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
        total: totalConDescuento,
        envio,
        recargo,
        acepta_politicas: true,
        estado: esCOD ? 'aprobado' : 'pendiente',
        ...(cuponInfo ? { cupon_id: cuponInfo.id, cupon_codigo: cuponInfo.codigo } : {}),
        ...(descuento > 0 ? { descuento } : {}),
        ...(esCOD
          ? { metodo_pago: 'CONTRA_ENTREGA', fecha_aprobado: new Date().toISOString() }
          : {}),
      })
      .select('id, numero_pedido, created_at')
      .single()

    if (pedidoError || !pedido) {
      if (cuponInfo) await liberarCupon(cuponInfo.id)
      console.error('Insert pedido error:', pedidoError)
      return respond(
        { error: 'Error al crear el pedido' },
        { status: 500 },
      )
    }

    // Cookie de verificación: el comprador recién creado ve sus datos completos
    // en /tienda/orden/[id] sin volver a validar el correo.
    cookieChanges.push({
      name: ORDER_VERIFY_COOKIE,
      value: firmarPedido(orderNumber),
      options: {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      },
    })

    // 4. Insertar items del pedido
    const pedidoItems = itemsFinal.map((item) => ({
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
      if (cuponInfo) await liberarCupon(cuponInfo.id)
      return respond(
        { error: 'Error al guardar los artículos del pedido' },
        { status: 500 },
      )
    }

    // 3. Registrar redención del cupón (1 uso por email). Si otra
    // solicitud concurrente usó el cupón con el mismo correo, rollback.
    if (cuponInfo) {
      const registrada = await registrarRedencion(cuponInfo.id, shipping.email, pedido.id)

      if (!registrada) {
        await supabase.from('pedido_items').delete().eq('pedido_id', pedido.id)
        await supabase.from('pedidos').delete().eq('id', pedido.id)
        await liberarCupon(cuponInfo.id)
        logger.warn('Checkout: cupón ya usado por email (race)', { requestId: rid, data: { codigo: cuponInfo.codigo } })
        return respond(
          { error: 'Ya usaste este cupón con ese correo' },
          { status: 400 },
        )
      }
    }

    // Contra entrega: no hay Wompi — confirmar por email y listo
    if (esCOD) {
      try {
        const [diasMin, diasMax] = getDiasEntrega(shipping.departamento)
        const entregaMin = new Date(
          new Date(pedido.created_at).getTime() + diasMin * 24 * 60 * 60 * 1000,
        ).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })
        const entregaMax = new Date(
          new Date(pedido.created_at).getTime() + diasMax * 24 * 60 * 60 * 1000,
        ).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })

        await sendOrderConfirmation({
          orderNumber,
          customerName: shipping.nombre,
          email: shipping.email,
          phone: shipping.telefono,
          address: shipping.direccion,
          departamento: shipping.departamento,
          city: shipping.ciudad,
          barrio: shipping.barrio,
          notes: shipping.notas,
          items: pedidoItems.map((i) => ({
            name: i.nombre,
            quantity: i.cantidad,
            price: i.precio,
            size: i.talla,
            color: i.color,
            imageUrl: i.imagen_url,
          })),
          total: totalConDescuento,
          estimatedDelivery: diasMin === diasMax ? entregaMin : `entre ${entregaMin} y ${entregaMax}`,
          metodoPago: 'CONTRA_ENTREGA',
          ...(descuento > 0 ? { descuento, cuponCodigo: cuponInfo?.codigo } : {}),
        })
      } catch (emailError) {
        console.error('sendOrderConfirmation (COD) error:', emailError)
      }

      logger.info('Pedido contra entrega creado', {
        requestId: rid,
        duration: Date.now() - start,
        data: { orderNumber, total: totalConDescuento, envio, recargo, descuento, itemsCount: items.length },
      })

      return respond(
        {
          metodo: 'contra_entrega',
          numero_pedido: orderNumber,
          pedido_id: pedido.id,
        },
        { status: 201 },
      )
    }

    // 5. Generar params para Wompi Widget
    const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY
    const integrityKey = process.env.WOMPI_INTEGRITY_KEY
    const amountInCents = Math.round(totalConDescuento * 100)

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
      data: { orderNumber, total: totalConDescuento, envio, descuento, itemsCount: items.length },
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

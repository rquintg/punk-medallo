import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { generateIntegritySignature } from '@/lib/wompi'
import { verifyCsrf } from '@/lib/csrf'
import { getRateLimitKey, checkRateLimit } from '@/lib/rate-limit'
import { logger, generateRequestId } from '@/lib/logger'
import { firmarPedido, ORDER_VERIFY_COOKIE } from '@/lib/order-verify'
import { generateOrderNumber } from '@/lib/order-number'
import { MAX_BOLETAS_POR_PERSONA } from '@/features/boletas/types'
import {
  validarCupon,
  consumirCupon,
  liberarCupon,
  registrarRedencion,
} from '@/features/cupones/services/cupones'
import { calcularDescuento, normalizarCodigo } from '@/features/cupones/calculo'
import { getSupabaseAdmin } from '@/features/admin/services/supabase-admin'

export const runtime = 'nodejs'

const MAX_ITEMS = 10

interface BoletaCheckoutRequest {
  items: Array<{ tipoId: string; cantidad: number }>
  cuponCodigo?: string
  nombre?: string
  telefono?: string
}

function getSupabase(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const c of cookiesToSet) {
            request.cookies.set(c)
          }
          response = NextResponse.next({ request })
          for (const c of cookiesToSet) {
            response.cookies.set(c)
          }
        },
      },
    },
  )

  return { supabase, response }
}

export async function POST(request: NextRequest) {
  const rid = generateRequestId()
  const start = Date.now()

  function respond(data: unknown, init?: ResponseInit) {
    return NextResponse.json(data, init)
  }

  // CSRF
  if (!verifyCsrf(request)) {
    logger.warn('BoletasCheckout: CSRF inválido', { requestId: rid })
    return respond({ error: 'Origen no autorizado' }, { status: 403 })
  }

  // Rate limit
  const rl = checkRateLimit(getRateLimitKey(request))
  if (!rl.allowed) {
    logger.warn('BoletasCheckout: rate limit excedido', { requestId: rid })
    return respond(
      { error: 'Demasiadas solicitudes. Intenta de nuevo en un minuto.' },
      { status: 429 },
    )
  }

  // Login OBLIGATORIO
  const { supabase, response } = getSupabase(request)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user || !user.email) {
    logger.warn('BoletasCheckout: sin sesión', { requestId: rid })
    return respond({ error: 'Debes iniciar sesión para comprar boletas' }, { status: 401 })
  }

  // Body
  let body: BoletaCheckoutRequest
  try {
    body = await request.json()
  } catch {
    return respond({ error: 'Body inválido' }, { status: 400 })
  }

  const rawItems = Array.isArray(body.items) ? body.items : []
  if (rawItems.length === 0 || rawItems.length > MAX_ITEMS) {
    return respond({ error: `Entre 1 y ${MAX_ITEMS} tipos por compra` }, { status: 400 })
  }

  // Normalizar cantidades (entero 1..4) + dedupe por tipoId
  const cantidades = new Map<string, number>()
  for (const it of rawItems) {
    const tipoId = String(it?.tipoId ?? '')
    const cantidad = Number(it?.cantidad)
    if (!tipoId || !Number.isInteger(cantidad) || cantidad < 1 || cantidad > MAX_BOLETAS_POR_PERSONA) {
      return respond({ error: 'Cantidad inválida' }, { status: 400 })
    }
    cantidades.set(tipoId, Math.min(MAX_BOLETAS_POR_PERSONA, (cantidades.get(tipoId) ?? 0) + cantidad))
  }

  const cuponCodigo = body.cuponCodigo ? normalizarCodigo(body.cuponCodigo) : null

  try {
    const admin = getSupabaseAdmin()
    const tipoIds = [...cantidades.keys()]

    // 1. Tipos + evento (join embebido)
    const { data: tiposData, error: tiposError } = await (admin.from('tipos_boleta') as any)
      .select(
        'id, nombre, precio, cantidad_total, evento_id, eventos_boletos(id, slug, titulo, fecha_evento, imagen_url, activo)',
      )
      .in('id', tipoIds)

    if (tiposError || !tiposData || tiposData.length !== tipoIds.length) {
      logger.warn('BoletasCheckout: tipos no encontrados', { requestId: rid, data: { tipoIds } })
      return respond({ error: 'Tipo de boleta no disponible' }, { status: 400 })
    }

    interface TipoConEvento {
      id: string
      nombre: string
      precio: number
      cantidad_total: number
      evento_id: string
      eventos_boletos: {
        id: string
        slug: string
        titulo: string
        fecha_evento: string
        imagen_url: string | null
        activo: boolean
      } | null
    }
    const tipos = tiposData as TipoConEvento[]

    // Todos los tipos deben ser del MISMO evento, activo y futuro
    const eventoIds = [...new Set(tipos.map((t) => t.evento_id))]
    if (eventoIds.length !== 1) {
      return respond({ error: 'No puedes mezclar eventos en una misma compra' }, { status: 400 })
    }

    const evento = tipos[0].eventos_boletos
    if (!evento || !evento.activo || new Date(evento.fecha_evento).getTime() < Date.now()) {
      return respond({ error: 'El evento ya no está disponible' }, { status: 400 })
    }

    // 2. Disponibilidad real = cupo − (boletas no anuladas + reservas en pedidos pendiente).
    //    La "reservación blanda" evita overselling durante la ventana de pago:
    //    dos usuarios pueden pasar el check simultáneo, pero solo uno paga antes
    //    de que el otro reserve; si el pago falla/anula, el cupo se libera solo.
    const { data: conteos } = await (admin.from('boletas') as any)
      .select('tipo_id')
      .in('tipo_id', tipoIds)
      .neq('estado', 'anulada')

    const vendidasPorTipo = new Map<string, number>()
    for (const b of (conteos ?? []) as { tipo_id: string }[]) {
      vendidasPorTipo.set(b.tipo_id, (vendidasPorTipo.get(b.tipo_id) ?? 0) + 1)
    }

    // Reservas: items de pedidos aún 'pendiente' (pago en curso)
    const { data: reservas } = await (admin.from('pedido_items') as any)
      .select('tipo_boleta_id, cantidad')
      .in('tipo_boleta_id', tipoIds)
      .eq('pedidos.estado', 'pendiente')

    for (const r of (reservas ?? []) as { tipo_boleta_id: string; cantidad: number }[]) {
      if (!r.tipo_boleta_id) continue
      vendidasPorTipo.set(r.tipo_boleta_id, (vendidasPorTipo.get(r.tipo_boleta_id) ?? 0) + (r.cantidad ?? 0))
    }

    for (const t of tipos) {
      const pedidas = cantidades.get(t.id)!
      const ocupadas = vendidasPorTipo.get(t.id) ?? 0
      const disponibles = t.cantidad_total - ocupadas
      if (pedidas > disponibles) {
        logger.warn('BoletasCheckout: sin cupo suficiente', { requestId: rid, data: { tipoId: t.id } })
        return respond(
          { error: `Solo quedan ${Math.max(0, disponibles)} boletas "${t.nombre}"` },
          { status: 409 },
        )
      }
    }

    // 3. Límite acumulativo por usuario+evento (anti-revendedores)
    const { count: yaCompradas } = await (admin.from('boletas') as any)
      .select('id', { count: 'exact', head: true })
      .eq('usuario_id', user.id)
      .eq('evento_id', eventoIds[0])
      .neq('estado', 'anulada')

    const pedidasTotal = tipoIds.reduce((s, id) => s + cantidades.get(id)!, 0)
    if ((yaCompradas ?? 0) + pedidasTotal > MAX_BOLETAS_POR_PERSONA) {
      logger.warn('BoletasCheckout: límite por persona excedido', {
        requestId: rid,
        data: { yaCompradas: yaCompradas ?? 0, pedidasTotal },
      })
      return respond(
        {
          error: `Límite de ${MAX_BOLETAS_POR_PERSONA} boletas por persona para este evento (ya tienes ${yaCompradas ?? 0})`,
        },
        { status: 409 },
      )
    }

    // 4. Total (sin envío ni recargo)
    const subtotal = tipos.reduce((s, t) => s + t.precio * cantidades.get(t.id)!, 0)

    // 5. Cupón opcional
    let descuento = 0
    let cuponId: string | null = null
    let cuponUsado: string | null = null

    if (cuponCodigo) {
      const validacion = await validarCupon(supabase, cuponCodigo, user.email, subtotal)
      if (!validacion.valido || !validacion.cupon) {
        const motivo = validacion.motivo
        logger.warn('BoletasCheckout: cupón rechazado', { requestId: rid, data: { motivo } })
        return respond(
          {
            error:
              motivo === 'ya_usado'
                ? 'Ya usaste este cupón con ese correo'
                : motivo === 'minimo'
                  ? 'Este cupón requiere un pedido mínimo'
                  : 'El cupón no es válido para este pedido',
          },
          { status: 400 },
        )
      }

      const reservado = await consumirCupon(validacion.cupon.id)
      if (reservado.errorMessage) {
        logger.error('BoletasCheckout: error RPC consumir cupón', {
          requestId: rid,
          error: reservado.errorMessage,
        })
        return respond({ error: 'No se pudo aplicar el cupón. Intenta de nuevo.' }, { status: 500 })
      }

      descuento = calcularDescuento(
        validacion.cupon.tipo as 'porcentaje' | 'fijo',
        validacion.cupon.valor,
        validacion.cupon.descuento_maximo,
        subtotal,
      )
      cuponId = validacion.cupon.id
      cuponUsado = cuponCodigo
    }

    const total = Math.max(0, subtotal - descuento)

    // 6. Número de pedido único
    let orderNumber = ''
    let attempts = 0
    while (attempts < 5) {
      orderNumber = generateOrderNumber()
      const { data: existing } = await admin
        .from('pedidos')
        .select('id')
        .eq('numero_pedido', orderNumber)
        .maybeSingle()
      if (!existing) break
      attempts++
    }
    if (attempts >= 5) {
      if (cuponId) await liberarCupon(cuponId)
      logger.error('BoletasCheckout: no se generó número de pedido único', { requestId: rid })
      return respond({ error: 'Error generando número de pedido. Intenta de nuevo.' }, { status: 500 })
    }

    // 7. Insert pedido (envio/recargo 0; dirección placeholder — la boleta no se envía)
    const rawNombre = typeof body.nombre === 'string' ? body.nombre.trim().slice(0, 60) : ''
    const rawTelefono = typeof body.telefono === 'string' ? body.telefono.replace(/\D/g, '').slice(0, 15) : ''
    const nombreUsuario =
      rawNombre.length >= 2
        ? rawNombre
        : ((user.user_metadata?.name as string | undefined)?.trim() ||
          (user.email.split('@')[0] ?? 'Comprador'))
    const telefonoLimpio = rawTelefono.length >= 10 ? rawTelefono : ''

    const { data: pedidoInsertado, error: pedidoError } = await (admin.from('pedidos') as any)
      .insert({
        usuario_id: user.id,
        numero_pedido: orderNumber,
        nombre_entrega: nombreUsuario,
        email: user.email,
        telefono: telefonoLimpio || '—',
        direccion: '—',
        ciudad: '—',
        departamento: '—',
        barrio: '',
        notas: '',
        total,
        envio: 0,
        recargo: 0,
        acepta_politicas: true,
        estado: 'pendiente',
        cupon_id: cuponId,
        cupon_codigo: cuponUsado,
        descuento,
        metodo_pago: null,
      })
      .select('id')
      .single()

    if (pedidoError || !pedidoInsertado) {
      if (cuponId) await liberarCupon(cuponId)
      logger.error('BoletasCheckout: error insertando pedido', {
        requestId: rid,
        error: String(pedidoError?.message),
      })
      return respond({ error: 'Error al crear el pedido' }, { status: 500 })
    }
    const pedidoId = pedidoInsertado.id as string

    async function rollbackPedido() {
      if (cuponId) await liberarCupon(cuponId)
      await admin.from('pedidos').delete().eq('id', pedidoId)
    }

    // 8. Items (producto_id NULL + tipo_boleta_id/evento_id seteados)
    const itemsPayload = tipos.map((t) => ({
      pedido_id: pedidoId,
      producto_id: null,
      variante_id: null,
      tipo_boleta_id: t.id,
      evento_id: t.evento_id,
      nombre: `${evento.titulo} — ${t.nombre}`,
      precio: t.precio,
      talla: null,
      color: null,
      cantidad: cantidades.get(t.id)!,
      imagen_url: evento.imagen_url,
    }))

    const { error: itemsError } = await (admin.from('pedido_items') as any).insert(itemsPayload)
    if (itemsError) {
      await rollbackPedido()
      logger.error('BoletasCheckout: error insertando items', {
        requestId: rid,
        error: String(itemsError?.message),
      })
      return respond({ error: 'Error al guardar las boletas del pedido' }, { status: 500 })
    }

    // 9. Redención del cupón (1 uso por email); race → rollback total
    if (cuponId && cuponUsado) {
      const redimido = await registrarRedencion(cuponId, user.email, pedidoId)
      if (!redimido) {
        await rollbackPedido()
        logger.warn('BoletasCheckout: redención duplicada de cupón', { requestId: rid })
        return respond({ error: 'Ya usaste este cupón con ese correo' }, { status: 400 })
      }
    }

    // 10. Wompi
    const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY
    const integrityKey = process.env.WOMPI_INTEGRITY_KEY

    if (!publicKey || !integrityKey) {
      await rollbackPedido()
      logger.error('BoletasCheckout: faltan llaves de Wompi', { requestId: rid })
      return respond(
        { error: 'Error de configuracion de pago. Contacta al administrador.' },
        { status: 500 },
      )
    }

    const amountInCents = Math.round(total * 100)
    const signature = generateIntegritySignature(orderNumber, amountInCents, 'COP', integrityKey)

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
    const isLocal = !siteUrl || siteUrl.includes('localhost')
    const redirectUrl = isLocal ? '' : `${siteUrl}/tienda/compra`

    // Cookie de verificación para /tienda/orden/[numero]
    response.cookies.set(ORDER_VERIFY_COOKIE, firmarPedido(orderNumber), {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    logger.info(`BoletasCheckout OK ${orderNumber} (${Date.now() - start}ms)`)

    return respond({
      metodo: 'boletas',
      numero_pedido: orderNumber,
      wompi: {
        currency: 'COP',
        amountInCents,
        reference: orderNumber,
        publicKey,
        signature: { integrity: signature },
        redirectUrl,
      },
    })
  } catch (err) {
    logger.error('BoletasCheckout: error inesperado', { requestId: rid, error: err })
    return respond({ error: 'Error interno. Intenta de nuevo.' }, { status: 500 })
  }
}

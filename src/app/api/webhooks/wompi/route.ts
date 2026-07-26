import { NextResponse, type NextRequest } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import {
  verifyEventSignature,
  getTransaction,
  mapWompiStatus,
  type WompiEvent,
} from '@/lib/wompi'
import { sendOrderConfirmation, sendOrderApproved, sendOrderDeclined } from '@/lib/email'
import { logger, generateRequestId } from '@/lib/logger'

let supabaseAdminClient: SupabaseClient | null = null

function getSupabaseAdmin() {
  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } },
    )
  }
  return supabaseAdminClient!
}

async function retryOnNetworkError<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (attempt === maxRetries - 1) throw err
      const msg = err instanceof Error ? err.message : String(err)
      const isRetryable = /ECONNRESET|ETIMEDOUT|fetch failed/i.test(msg)
      if (!isRetryable) throw err
      logger.warn(`Reintento ${attempt + 2}/${maxRetries}`, { data: { error: msg } })
      await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)))
    }
  }
  throw new Error('unreachable')
}

type DeductedItem = {
  producto_id: string
  stockBefore: number
} | {
  variante_id: string
  stockBefore: number
}

async function rollbackStock(deductedItems: DeductedItem[]) {
  for (const d of deductedItems) {
    if ('variante_id' in d) {
      await getSupabaseAdmin().from('producto_variantes').update({ stock: d.stockBefore }).eq('id', d.variante_id)
    } else {
      await getSupabaseAdmin().from('productos').update({ stock: d.stockBefore }).eq('id', d.producto_id)
    }
  }
}

export async function POST(request: NextRequest) {
  const rid = generateRequestId()
  const start = Date.now()

  try {
    const body: WompiEvent = await request.json()

    if (body.event !== 'transaction.updated') {
      logger.info('Webhook ignorado: evento no es transaction.updated', { requestId: rid, data: { event: body.event } })
      return NextResponse.json({ received: true })
    }

    const eventsKey = process.env.WOMPI_EVENTS_KEY
    if (eventsKey && !verifyEventSignature(body, eventsKey)) {
      logger.error('Firma inválida en webhook', { requestId: rid })
      return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })
    }

    const transactionId = body.data.transaction.id
    const reference = body.data.transaction.reference
    const wompiStatus = body.data.transaction.status
    const newEstado = mapWompiStatus(wompiStatus)

    logger.info('Webhook recibido', {
      requestId: rid,
      data: { transactionId, reference, wompiStatus, newEstado },
    })

    const { data: pedido, error: pedidoError } = await getSupabaseAdmin()
      .from('pedidos')
      .select('id, estado, total, email, nombre_entrega, telefono, direccion, ciudad, departamento, barrio, notas, created_at')
      .eq('numero_pedido', reference)
      .single()

    if (pedidoError || !pedido) {
      logger.error('Pedido no encontrado en webhook', { requestId: rid, data: { reference, error: pedidoError } })
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    const terminalStates: string[] = ['aprobado', 'rechazado', 'anulado', 'error', 'enviado', 'entregado']
    if (terminalStates.includes(pedido.estado)) {
      logger.info('Webhook ignorado: pedido ya en estado terminal', {
        requestId: rid,
        data: { reference, estadoActual: pedido.estado },
      })
      return NextResponse.json({ received: true })
    }

    const transaction = await getTransaction(transactionId)

    if (!transaction) {
      logger.error('No se pudo verificar transacción en Wompi', { requestId: rid, data: { transactionId } })
      return NextResponse.json({ error: 'Error verificando transacción' }, { status: 500 })
    }

    const verifiedEstado = mapWompiStatus(transaction.status)
    const expectedCents = Math.round(pedido.total * 100)

    if (transaction.amount_in_cents !== expectedCents) {
      logger.error('Monto de transacción no coincide', {
        requestId: rid,
        data: { reference, esperado: expectedCents, recibido: transaction.amount_in_cents },
      })
      return NextResponse.json({ error: 'Monto de transacción no coincide' }, { status: 400 })
    }

    if (verifiedEstado === 'aprobado') {
      const { data: items, error: itemsError } = await getSupabaseAdmin()
        .from('pedido_items')
        .select('producto_id, variante_id, cantidad')
        .eq('pedido_id', pedido.id)

      if (itemsError || !items) {
        logger.error('Error obteniendo items del pedido', { requestId: rid, data: { pedidoId: pedido.id, error: itemsError } })
        return NextResponse.json({ error: 'Error obteniendo items del pedido' }, { status: 500 })
      }

      await retryOnNetworkError(async () => {
        const deductedItems: DeductedItem[] = []

        try {
          for (const item of items) {
            if (item.variante_id) {
              const { data: variant, error: variantError } = await getSupabaseAdmin()
                .from('producto_variantes')
                .select('stock')
                .eq('id', item.variante_id)
                .single()

              if (variantError || !variant) {
                await rollbackStock(deductedItems)
                throw new Error(`Variante no encontrada: ${item.variante_id}`)
              }

              if (variant.stock < item.cantidad) {
                await rollbackStock(deductedItems)
                throw new Error(`Stock insuficiente en variante: ${item.variante_id}`)
              }

              const stockBefore = variant.stock
              const { error: updateError } = await getSupabaseAdmin()
                .from('producto_variantes')
                .update({ stock: Math.max(0, stockBefore - item.cantidad) })
                .eq('id', item.variante_id)

              if (updateError) {
                await rollbackStock(deductedItems)
                throw new Error(`Error actualizando stock de variante: ${item.variante_id}`)
              }

              deductedItems.push({ variante_id: item.variante_id, stockBefore })
            } else {
              const { data: product, error: productError } = await getSupabaseAdmin()
                .from('productos')
                .select('stock')
                .eq('id', item.producto_id)
                .single()

              if (productError || !product) {
                await rollbackStock(deductedItems)
                throw new Error(`Producto no encontrado: ${item.producto_id}`)
              }

              if (product.stock < item.cantidad) {
                await rollbackStock(deductedItems)
                throw new Error(`Stock insuficiente: ${item.producto_id}`)
              }

              const stockBefore = product.stock
              const { error: updateError } = await getSupabaseAdmin()
                .from('productos')
                .update({ stock: Math.max(0, stockBefore - item.cantidad) })
                .eq('id', item.producto_id)

              if (updateError) {
                await rollbackStock(deductedItems)
                throw new Error(`Error actualizando stock: ${item.producto_id}`)
              }

              deductedItems.push({ producto_id: item.producto_id, stockBefore })
            }
          }

          const { error: estadoError } = await getSupabaseAdmin()
            .from('pedidos')
            .update({ estado: verifiedEstado })
            .eq('id', pedido.id)

          if (estadoError) {
            await rollbackStock(deductedItems)
            throw new Error(`Error actualizando estado: ${pedido.id}`)
          }

          const { data: productosAfectados } = await getSupabaseAdmin()
            .from('productos')
            .select('slug')
            .in('id', items.map(i => i.producto_id))

          for (const p of productosAfectados ?? []) {
            revalidatePath(`/tienda/${p.slug}`)
          }
          revalidatePath('/tienda')

          logger.info('Stock descontado y pedido aprobado', {
            requestId: rid,
            data: { reference, items: deductedItems.length, revalidados: productosAfectados?.length },
          })
        } catch (err) {
          await rollbackStock(deductedItems)
          logger.error('Error en proceso de aprobación, stock revertido', {
            requestId: rid,
            error: err,
            data: { reference, deductedItems: deductedItems.length },
          })
          throw err
        }
      })
    } else {
      const { error: updateError } = await getSupabaseAdmin()
        .from('pedidos')
        .update({ estado: verifiedEstado })
        .eq('id', pedido.id)

      if (updateError) {
        logger.error('Error actualizando pedido', { requestId: rid, data: { pedidoId: pedido.id, error: updateError } })
        return NextResponse.json({ error: 'Error actualizando pedido' }, { status: 500 })
      }

      logger.info('Pedido actualizado', { requestId: rid, data: { reference, estado: verifiedEstado } })
    }

    const estimatedDelivery = new Date(
      new Date(pedido.created_at).getTime() + 5 * 24 * 60 * 60 * 1000,
    ).toLocaleDateString('es-CO', { dateStyle: 'long' })

    if (verifiedEstado === 'aprobado') {
      const { data: pedidoItems } = await getSupabaseAdmin()
        .from('pedido_items')
        .select('nombre, precio, talla, color, cantidad, imagen_url')
        .eq('pedido_id', pedido.id)

      await sendOrderConfirmation({
        orderNumber: reference,
        customerName: pedido.nombre_entrega,
        email: pedido.email,
        phone: pedido.telefono ?? '',
        address: pedido.direccion ?? '',
        departamento: pedido.departamento ?? '',
        city: pedido.ciudad ?? '',
        barrio: pedido.barrio ?? '',
        notes: pedido.notas ?? '',
        items: (pedidoItems ?? []).map((i) => ({
          name: i.nombre,
          quantity: i.cantidad,
          price: i.precio,
          size: i.talla,
          color: i.color,
          imageUrl: i.imagen_url,
        })),
        total: pedido.total,
        estimatedDelivery,
      })

      await sendOrderApproved({
        orderNumber: reference,
        customerName: pedido.nombre_entrega,
        email: pedido.email,
      })

      logger.info('Emails de confirmación y aprobación enviados', { requestId: rid, data: { reference } })
    } else if (['rechazado', 'anulado', 'error'].includes(verifiedEstado)) {
      await sendOrderDeclined({
        orderNumber: reference,
        customerName: pedido.nombre_entrega,
        email: pedido.email,
        reason: wompiStatus === 'DECLINED' ? 'rechazado' : wompiStatus === 'VOIDED' ? 'anulado' : 'error en el procesamiento',
      })

      logger.info('Email de declinación enviado', { requestId: rid, data: { reference, estado: verifiedEstado } })
    }

    logger.info('Webhook procesado exitosamente', {
      requestId: rid,
      duration: Date.now() - start,
      data: { reference, estado: verifiedEstado },
    })

    return NextResponse.json({ received: true })
  } catch (err) {
    logger.error('Error en webhook Wompi', { requestId: rid, error: err, duration: Date.now() - start })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

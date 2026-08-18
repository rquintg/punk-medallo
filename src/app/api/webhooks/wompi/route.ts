import { NextResponse, type NextRequest } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import {
  verifyEventSignature,
  getTransaction,
  mapWompiStatus,
  type WompiEvent,
} from '@/lib/wompi'
import { logger, generateRequestId } from '@/lib/logger'
import {
  aprobarPedido,
  enviarEmailsAprobacion,
  procesarEstadoNoAprobado,
  SELECT_PEDIDO_PARA_PAGO,
} from '@/lib/aprobar-pedido'

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
      .select(`${SELECT_PEDIDO_PARA_PAGO}, estado`)
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
      const resultado = await retryOnNetworkError(async () => {
        const r = await aprobarPedido(getSupabaseAdmin(), pedido, transactionId, transaction)
        if (r !== 'ya_procesado') {
          logger.info('Stock descontado y pedido aprobado', {
            requestId: rid,
            data: { reference, pedidoId: pedido.id, resultado: r },
          })
        }
        return r
      })

      if (resultado === 'ya_procesado') {
        logger.info('Webhook: pedido ya procesado por otro evento, se omite', {
          requestId: rid,
          data: { reference, pedidoId: pedido.id },
        })
      } else if (resultado === 'rechazado_stock') {
        logger.info('Webhook: pedido rechazado por stock insuficiente', {
          requestId: rid,
          data: { reference, pedidoId: pedido.id },
        })
      } else {
        await enviarEmailsAprobacion(getSupabaseAdmin(), pedido)
        logger.info('Emails de confirmación y aprobación enviados', { requestId: rid, data: { reference } })
      }
    } else {
      await procesarEstadoNoAprobado(getSupabaseAdmin(), pedido, wompiStatus, verifiedEstado)

      logger.info('Pedido actualizado', { requestId: rid, data: { reference, estado: verifiedEstado } })
      if (['rechazado', 'anulado', 'error'].includes(verifiedEstado)) {
        logger.info('Email de declinación enviado', { requestId: rid, data: { reference, estado: verifiedEstado } })
      }
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

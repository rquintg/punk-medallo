import { NextResponse, type NextRequest } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { logger, generateRequestId } from '@/lib/logger'
import { getTransactionsByReference, mapWompiStatus } from '@/lib/wompi'
import {
  aprobarPedido,
  enviarEmailsAprobacion,
  procesarEstadoNoAprobado,
  SELECT_PEDIDO_PARA_PAGO,
  type PedidoParaPago,
} from '@/lib/aprobar-pedido'

export const dynamic = 'force-dynamic'

// No tocar pedidos frescos: el webhook (o un PSE en curso) puede llegar dentro
// de los primeros minutos.
const MIN_EDAD_PENDIENTE_MS = 30 * 60 * 1000
// Pedido sin ninguna transacción en Wompi tras 24h = abandono real del checkout.
const ANULAR_SIN_TRANSACCION_MS = 24 * 60 * 60 * 1000
const LIMITE_POR_EJECUCION = 20

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

export async function GET(request: NextRequest) {
  const rid = generateRequestId()
  const start = Date.now()

  const secret = request.nextUrl.searchParams.get('secret')
  if (!secret || secret !== process.env.CRON_SECRET) {
    logger.warn('Cron: secret inválido', { requestId: rid })
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const ahora = Date.now()
    const edadMinimaIso = new Date(ahora - MIN_EDAD_PENDIENTE_MS).toISOString()

    const { data: pendientes, error } = await getSupabaseAdmin()
      .from('pedidos')
      .select(SELECT_PEDIDO_PARA_PAGO)
      .eq('estado', 'pendiente')
      .lt('created_at', edadMinimaIso)
      .order('created_at', { ascending: true })
      .limit(LIMITE_POR_EJECUCION)

    if (error) {
      logger.error('Cron: error consultando pendientes', { requestId: rid, error, duration: Date.now() - start })
      return NextResponse.json({ error: 'Error consultando pendientes' }, { status: 500 })
    }

    if (!pendientes || pendientes.length === 0) {
      logger.info('Cron: sin pedidos pendientes por reconciliar', { requestId: rid, duration: Date.now() - start })
      return NextResponse.json({ processed: 0, failed: 0, skipped: 0 })
    }

    const resultados = { aprobados: 0, rechazados: 0, anulados: 0, salteados: 0, fallidos: 0 }
    const errores: string[] = []

    for (const row of pendientes) {
      const pedido = row as PedidoParaPago
      try {
        const transacciones = await getTransactionsByReference(pedido.numero_pedido)

        if (transacciones.length === 0) {
          if (ahora - new Date(pedido.created_at).getTime() > ANULAR_SIN_TRANSACCION_MS) {
            await getSupabaseAdmin()
              .from('pedidos')
              .update({ estado: 'anulado' })
              .eq('id', pedido.id)
            resultados.anulados++
            logger.info('Cron: pendiente sin transacción anulado (checkout abandonado)', {
              requestId: rid,
              data: { numero_pedido: pedido.numero_pedido },
            })
          } else {
            resultados.salteados++
            logger.info('Cron: pendiente aún dentro de ventana de pago', {
              requestId: rid,
              data: { numero_pedido: pedido.numero_pedido },
            })
          }
          continue
        }

        // Si hay varias, preferir la aprobada; si no, la más reciente.
        const transaction =
          transacciones.find((t) => t.status === 'APPROVED') ??
          [...transacciones].sort((a, b) => b.created_at.localeCompare(a.created_at))[0]

        if (transaction.status === 'PENDING') {
          resultados.salteados++
          continue
        }

        const expectedCents = Math.round(pedido.total * 100)
        if (transaction.amount_in_cents !== expectedCents) {
          resultados.salteados++
          logger.warn('Cron: monto de transacción no coincide, se deja pendiente', {
            requestId: rid,
            data: { numero_pedido: pedido.numero_pedido, esperado: expectedCents, recibido: transaction.amount_in_cents },
          })
          continue
        }

        const verifiedEstado = mapWompiStatus(transaction.status)

        if (verifiedEstado === 'aprobado') {
          await aprobarPedido(getSupabaseAdmin(), pedido, transaction.id, transaction)
          try {
            await enviarEmailsAprobacion(getSupabaseAdmin(), pedido)
          } catch (emailErr) {
            // El pedido ya quedó aprobado; los emails pueden reintentarse aparte.
            logger.error('Cron: emails de aprobación fallaron', {
              requestId: rid,
              error: emailErr,
              data: { numero_pedido: pedido.numero_pedido },
            })
          }
          resultados.aprobados++
          logger.info('Cron: pedido pendiente aprobado por reconciliación', {
            requestId: rid,
            data: { numero_pedido: pedido.numero_pedido, transactionId: transaction.id },
          })
        } else {
          await procesarEstadoNoAprobado(getSupabaseAdmin(), pedido, transaction.status, verifiedEstado)
          resultados.rechazados++
          logger.info('Cron: pedido pendiente llevado a estado terminal por reconciliación', {
            requestId: rid,
            data: { numero_pedido: pedido.numero_pedido, estado: verifiedEstado },
          })
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        resultados.fallidos++
        errores.push(`${pedido.numero_pedido}: ${msg}`)
        logger.error('Cron: error reconciliando pedido', { requestId: rid, error: err, data: { numero_pedido: pedido.numero_pedido } })
      }
    }

    logger.info('Cron de reconciliación completado', {
      requestId: rid,
      duration: Date.now() - start,
      data: { total: pendientes.length, ...resultados },
    })

    return NextResponse.json({ total: pendientes.length, ...resultados, errores })
  } catch (err) {
    logger.error('Cron: error general', { requestId: rid, error: err, duration: Date.now() - start })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
import { NextResponse, type NextRequest } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { sendCartAbandoned } from '@/lib/email'
import { logger, generateRequestId } from '@/lib/logger'

export const dynamic = 'force-dynamic'

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
    const { data: pedidos, error: pedidosError } = await getSupabaseAdmin()
      .from('pedidos')
      .select('id, numero_pedido, email, nombre_entrega, total')
      .eq('estado', 'pendiente')
      .eq('recordatorio_abandono', false)
      .order('created_at', { ascending: true })

    if (pedidosError) {
      logger.error('Cron: error consultando pedidos', { requestId: rid, error: pedidosError })
      return NextResponse.json({ error: 'Error consultando pedidos' }, { status: 500 })
    }

    if (!pedidos || pedidos.length === 0) {
      logger.info('Cron: no hay pedidos abandonados', { requestId: rid, duration: Date.now() - start })
      return NextResponse.json({ processed: 0, failed: 0 })
    }

    const errors: string[] = []
    let processed = 0

    for (const pedido of pedidos) {
      try {
        const { data: items } = await getSupabaseAdmin()
          .from('pedido_items')
          .select('nombre, cantidad, precio')
          .eq('pedido_id', pedido.id)

        const emailResult = await sendCartAbandoned({
          orderNumber: pedido.numero_pedido,
          customerName: pedido.nombre_entrega,
          email: pedido.email,
          items: (items ?? []).map((i) => ({
            name: i.nombre,
            quantity: i.cantidad,
            price: i.precio,
          })),
          total: pedido.total,
        })

        if (emailResult.error) {
          errors.push(`Email falló para ${pedido.numero_pedido}: ${emailResult.error.message}`)
          continue
        }

        const { error: updateError } = await getSupabaseAdmin()
          .from('pedidos')
          .update({ recordatorio_abandono: true })
          .eq('id', pedido.id)

        if (updateError) {
          errors.push(`Update falló para ${pedido.numero_pedido}: ${updateError.message}`)
          continue
        }

        processed++
        logger.info('Cron: recordatorio enviado para pedido pendiente', {
          requestId: rid,
          data: { orderNumber: pedido.numero_pedido },
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        errors.push(`Error inesperado para ${pedido.numero_pedido}: ${msg}`)
      }
    }

    logger.info('Cron completado', {
      requestId: rid,
      duration: Date.now() - start,
      data: { total: pedidos.length, processed, failed: errors.length },
    })

    return NextResponse.json({ processed, failed: errors.length, errors })
  } catch (err) {
    logger.error('Cron: error general', { requestId: rid, error: err, duration: Date.now() - start })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

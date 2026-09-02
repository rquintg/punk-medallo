import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/features/admin/services/supabase-admin'
import { generateIntegritySignature } from '@/lib/wompi'
import { verifyCsrf } from '@/lib/csrf'
import { getRateLimitKey, checkRateLimit } from '@/lib/rate-limit'
import { logger, generateRequestId } from '@/lib/logger'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const rid = generateRequestId()
  if (!verifyCsrf(request)) {
    return NextResponse.json({ error: 'Origen no autorizado' }, { status: 403 })
  }
  const rl = checkRateLimit(getRateLimitKey(request))
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Demasiadas solicitudes' }, { status: 429 })
  }

  let body: { numero_pedido?: string; numeroPedido?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }
  const numero = (body.numero_pedido ?? body.numeroPedido ?? '').trim()
  if (!numero || !/^PM-[A-Z0-9]{6,}$/.test(numero)) {
    return NextResponse.json({ error: 'Número de pedido inválido' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client sin Database generic (patrón tienda: as unknown as)
  const { data: pedido, error } = await (supabase.from('pedidos') as any)
    .select('numero_pedido, total, estado, email, nombre_entrega, telefono, direccion, ciudad, departamento')
    .eq('numero_pedido', numero)
    .maybeSingle()

  if (error || !pedido) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  }
  if (pedido.estado !== 'pendiente') {
    return NextResponse.json({ error: pedido.estado === 'aprobado' ? 'Pedido ya pagado' : 'Pedido no disponible para pago' }, { status: 409 })
  }

  const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY
  const integrityKey = process.env.WOMPI_INTEGRITY_KEY
  if (!publicKey || !integrityKey) {
    logger.error('RecuperarPedido: faltan llaves Wompi', { requestId: rid })
    return NextResponse.json({ error: 'Error de configuración de pago' }, { status: 500 })
  }

  const amountInCents = Math.round((pedido.total as number) * 100)
  const signature = generateIntegritySignature(numero, amountInCents, 'COP', integrityKey)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://punkmedallo.com'
  const isLocal = siteUrl.startsWith('http://localhost') || siteUrl.startsWith('http://127.0.0.1')
  const redirectUrl = isLocal ? '' : `${siteUrl}/tienda/compra`

  const phoneDigits = String(pedido.telefono ?? '').replace(/\D/g, '').slice(0, 15)
  const tieneTelefono = phoneDigits.length >= 10

  // Wompi WidgetCheckout exige phoneNumberPrefix cuando hay customerData.phoneNumber
  // Usamos el mismo contrato que src/app/tienda/checkout/checkout-content.tsx:248
  const customerData: Record<string, string> = {
    email: pedido.email ?? '',
    fullName: pedido.nombre_entrega ?? '',
  }
  if (tieneTelefono) {
    customerData.phoneNumber = phoneDigits
    customerData.phoneNumberPrefix = '+57'
  }

  logger.info('RecuperarPedido OK', { requestId: rid, data: { numero } })

  return NextResponse.json({
    wompi: {
      publicKey,
      amountInCents,
      currency: 'COP',
      reference: numero,
      signature: { integrity: signature },
      redirectUrl,
      customerData: Object.keys(customerData).length ? customerData : undefined,
    },
  })
}

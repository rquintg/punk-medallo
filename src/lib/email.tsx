import { Resend } from 'resend'
import type { SupabaseClient } from '@supabase/supabase-js'
import { render } from '@react-email/components'
import OrderConfirmation from '@/emails/order-confirmation'
import OrderApproved from '@/emails/order-approved'
import OrderDeclined from '@/emails/order-declined'
import CartAbandoned from '@/emails/cart-abandoned'
import OrderPreparing from '@/emails/order-preparing'
import OrderShipped from '@/emails/order-shipped'
import OrderDelivered from '@/emails/order-delivered'
import StockAvailable from '@/emails/stock-available'
import TicketEmail from '@/emails/ticket'
import { sitioUrl } from '@/lib/site-url'
import { construirQrPayload } from '@/lib/ticket-crypto'
import QRCode from 'qrcode'
import { getTiendaConfig } from '@/features/tienda/services/tienda-config'
import { getSupabaseAdmin } from '@/features/admin/services/supabase-admin'

const LOGO_EMAIL_DEFAULT = 'https://punkmedallo.com/logo_punk_medallo.jpg'

/** Logo actual (config DB o default) para las plantillas de email */
async function logoEmail(): Promise<string> {
  try {
    return (await getTiendaConfig()).logoUrl ?? LOGO_EMAIL_DEFAULT
  } catch {
    return LOGO_EMAIL_DEFAULT
  }
}

export interface OrderConfirmationData {
  orderNumber: string
  customerName: string
  email: string
  phone: string
  address: string
  departamento: string
  city: string
  barrio: string
  notes: string
  items: Array<{
    name: string
    quantity: number
    price: number
    size: string | null
    color: string | null
    imageUrl: string | null
  }>
  total: number
  estimatedDelivery: string
  metodoPago?: string | null
  descuento?: number
  cuponCodigo?: string
}

export interface OrderApprovedData {
  orderNumber: string
  customerName: string
  email: string
}

export interface OrderDeclinedData {
  orderNumber: string
  customerName: string
  email: string
  reason: string
}

export interface OrderStatusEmailData {
  orderNumber: string
  customerName: string
  email: string
}

export interface CartAbandonedData {
  orderNumber: string
  customerName: string
  email: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total: number
}

export interface StockAvailableData {
  customerName: string
  email: string
  productName: string
  productUrl: string
  comboLabel?: string | null
}

let resendClient: Resend | null = null

function getResend(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY no está configurada')
    }
    resendClient = new Resend(apiKey)
  }
  return resendClient
}

const emailFrom = process.env.EMAIL_FROM ?? 'Punk Medallo <info@punkmedallo.com>'

export async function sendOrderConfirmation(data: OrderConfirmationData) {
  const siteUrl = sitioUrl()
  const logoUrl = await logoEmail()

  const html = await render(
    <OrderConfirmation
      orderNumber={data.orderNumber}
      customerName={data.customerName}
      email={data.email}
      phone={data.phone}
      address={data.address}
      departamento={data.departamento}
      city={data.city}
      barrio={data.barrio}
      notes={data.notes}
      items={data.items}
      total={data.total}
      estimatedDelivery={data.estimatedDelivery}
      metodoPago={data.metodoPago ?? null}
      descuento={data.descuento}
      cuponCodigo={data.cuponCodigo}
      orderUrl={`${siteUrl}/tienda/orden/${data.orderNumber}`}
      trackingUrl={`${siteUrl}/tienda/rastrear`}
      logoUrl={logoUrl}
    />,
  )

  const resend = getResend()
  const { error } = await resend.emails.send({
    from: emailFrom,
    to: data.email,
    subject: `Gracias por tu compra — ${data.orderNumber}`,
    html,
  })

  if (error) {
    console.error('sendOrderConfirmation error:', error)
  }

  return { error }
}


/**
 * Genera el PNG del QR de una boleta y lo hospeda en Supabase Storage.
 * Los clientes de correo (Gmail/Outlook) bloquean data-URIs: se necesita
 * URL pública. Path estable `boletas/{codigo}.png` + upsert (sin duplicados).
 */
async function qrHosteado(codigo: string): Promise<string> {
  const png = await QRCode.toBuffer(construirQrPayload(codigo), {
    width: 320,
    margin: 1,
    color: { dark: '#111111', light: '#ffffff' },
    type: 'png' as const,
  })

  const admin = getSupabaseAdmin()
  const path = `boletas/${codigo}.png`
  const { error: upError } = await admin.storage
    .from('productos')
    .upload(path, png, { contentType: 'image/png', upsert: true })
  if (upError) throw new Error(`Error subiendo QR: ${upError.message}`)

  return admin.storage.from('productos').getPublicUrl(path).data.publicUrl
}

/**
 * Reenvía el email de UNA boleta (desde /cuenta/boletas).
 * Verifica que la boleta pertenezca al email del usuario autenticado.
 */
export async function reenviarTicketEmail(
  codigo: string,
  userEmail: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const admin = getSupabaseAdmin()

    // Boleta + pedido (para nombre del titular) + tipo + evento
    const { data: b, error: bError } = await (admin.from('boletas') as any)
      .select('codigo, estado, titular_email, titular_nombre, pedido_id, tipo_id, evento_id')
      .eq('codigo', codigo)
      .maybeSingle()

    if (bError || !b) return { ok: false, error: 'Boleta no encontrada' }
    if ((b.titular_email ?? '').toLowerCase() !== userEmail.toLowerCase()) {
      return { ok: false, error: 'Esta boleta no pertenece a tu cuenta' }
    }
    if (b.estado === 'anulada') return { ok: false, error: 'Esta boleta está anulada' }

    const [{ data: tipo }, { data: ev }] = await Promise.all([
      (admin.from('tipos_boleta') as any).select('nombre').eq('id', b.tipo_id).maybeSingle(),
      (admin.from('eventos_boletos') as any)
        .select('titulo, fecha_evento, lugar')
        .eq('id', b.evento_id)
        .maybeSingle(),
    ])

    const qrUrl = await qrHosteado(b.codigo)

    const html = await render(
      TicketEmail({
        orderNumber: `Reenvío · ${b.codigo}`,
        customerName: b.titular_nombre ?? userEmail.split('@')[0],
        eventoTitulo: ev?.titulo ?? 'Evento Punk Medallo',
        eventoFecha: ev?.fecha_evento
          ? new Date(ev.fecha_evento).toLocaleString('es-CO', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '',
        eventoLugar: ev?.lugar ?? '',
        boletas: [
          { codigo: b.codigo, qrDataUrl: qrUrl, tipoNombre: tipo?.nombre ?? 'General' },
        ],
        logoUrl: await logoEmail(),
        orderUrl: `${sitioUrl()}/cuenta/boletas`,
      }),
    )

    const resend = getResend()
    const { error: sendError } = await resend.emails.send({
      from: emailFrom,
      to: userEmail,
      subject: `Tu boleta — ${b.codigo}`,
      html,
    })
    if (sendError) throw new Error(sendError.message)

    return { ok: true }
  } catch (e: any) {
    console.error('[Boletas] Error reenviando ticket:', e?.message)
    return { ok: false, error: 'Error al reenviar. Intenta de nuevo.' }
  }
}

export interface TicketEmailData {
  orderNumber: string
  customerName: string
  email: string
  /** Evento de las boletas — determinista, nunca inferir por nombre de tipo */
  eventoId: string
  boletas: Array<{ codigo: string; tipoNombre: string }>
}

/**
 * Email con las boletas del pedido (QR por boleta).
 * Necesita el cliente supabase (service o SSR) para leer el evento asociado.
 */
export async function sendTicketsEmail(
  data: TicketEmailData,
  supabase: SupabaseClient,
) {
  const siteUrl = sitioUrl()
  const logoUrl = await logoEmail()

  // Evento: por id directo (todas las boletas son del mismo evento)
  let eventoTitulo = 'Evento Punk Medallo'
  let eventoFecha = ''
  let eventoLugar = ''

  if (data.eventoId) {
    const { data: ev } = await (supabase.from('eventos_boletos') as any)
      .select('titulo, fecha_evento, lugar')
      .eq('id', data.eventoId)
      .maybeSingle()
    if (ev) {
      eventoTitulo = ev.titulo
      eventoFecha = new Date(ev.fecha_evento).toLocaleString('es-CO', {
        weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
      })
      eventoLugar = ev.lugar
    }
  }

  // QR PNG data-url por boleta
  const conQr = await Promise.all(
    data.boletas.map(async (b) => ({
      ...b,
      qrDataUrl: await qrHosteado(b.codigo),
    })),
  )

  const html = await render(
    <TicketEmail
      orderNumber={data.orderNumber}
      customerName={data.customerName}
      eventoTitulo={eventoTitulo}
      eventoFecha={eventoFecha}
      eventoLugar={eventoLugar}
      boletas={conQr}
      logoUrl={logoUrl}
      orderUrl={`${siteUrl}/cuenta/boletas`}
    />,
  )

  const resend = getResend()
  await resend.emails.send({
    from: emailFrom,
    to: data.email,
    subject: `Tus boletas — ${data.orderNumber}`,
    html,
  })
}

export async function sendOrderApproved(data: OrderApprovedData) {
  const siteUrl = sitioUrl()
  const logoUrl = await logoEmail()

  const html = await render(
    <OrderApproved
      orderNumber={data.orderNumber}
      customerName={data.customerName}
      orderUrl={`${siteUrl}/tienda/orden/${data.orderNumber}`}
      trackingUrl={`${siteUrl}/tienda/rastrear`}
      logoUrl={logoUrl}
    />,
  )

  const resend = getResend()
  const { error } = await resend.emails.send({
    from: emailFrom,
    to: data.email,
    subject: `¡Pago aprobado! — ${data.orderNumber}`,
    html,
  })

  if (error) {
    console.error('sendOrderApproved error:', error)
  }

  return { error }
}

export async function sendOrderDeclined(data: OrderDeclinedData) {
  const logoUrl = await logoEmail()

  const html = await render(
    <OrderDeclined
      orderNumber={data.orderNumber}
      customerName={data.customerName}
      reason={data.reason}
      logoUrl={logoUrl}
    />,
  )

  const resend = getResend()
  const { error } = await resend.emails.send({
    from: emailFrom,
    to: data.email,
    subject: `Pago no procesado — ${data.orderNumber}`,
    html,
  })

  if (error) {
    console.error('sendOrderDeclined error:', error)
  }

  return { error }
}

export async function sendCartAbandoned(data: CartAbandonedData) {
  const siteUrl = sitioUrl()
  const logoUrl = await logoEmail()

  const html = await render(
    <CartAbandoned
      orderNumber={data.orderNumber}
      customerName={data.customerName}
      items={data.items}
      total={data.total}
      siteUrl={siteUrl}
      logoUrl={logoUrl}
    />,
  )

  const resend = getResend()
  const { error } = await resend.emails.send({
    from: emailFrom,
    to: data.email,
    subject: `¿Olvidaste tu compra? — ${data.orderNumber}`,
    html,
  })

  if (error) {
    console.error('sendCartAbandoned error:', error)
  }

  return { error }
}

export async function sendOrderPreparing(data: OrderStatusEmailData) {
  const siteUrl = sitioUrl()
  const logoUrl = await logoEmail()

  const html = await render(
    <OrderPreparing
      orderNumber={data.orderNumber}
      customerName={data.customerName}
      trackingUrl={`${siteUrl}/tienda/rastrear`}
      logoUrl={logoUrl}
    />,
  )

  const resend = getResend()
  const { error } = await resend.emails.send({
    from: emailFrom,
    to: data.email,
    subject: `Estamos preparando tu pedido — ${data.orderNumber}`,
    html,
  })

  if (error) {
    console.error('sendOrderPreparing error:', error)
  }

  return { error }
}

export async function sendOrderShipped(data: OrderStatusEmailData) {
  const siteUrl = sitioUrl()
  const logoUrl = await logoEmail()

  const html = await render(
    <OrderShipped
      orderNumber={data.orderNumber}
      customerName={data.customerName}
      trackingUrl={`${siteUrl}/tienda/rastrear`}
      logoUrl={logoUrl}
    />,
  )

  const resend = getResend()
  const { error } = await resend.emails.send({
    from: emailFrom,
    to: data.email,
    subject: `Tu pedido ${data.orderNumber} ha sido enviado`,
    html,
  })

  if (error) {
    console.error('sendOrderShipped error:', error)
  }

  return { error }
}

export async function sendOrderDelivered(data: OrderStatusEmailData) {
  const siteUrl = sitioUrl()
  const logoUrl = await logoEmail()

  const html = await render(
    <OrderDelivered
      orderNumber={data.orderNumber}
      customerName={data.customerName}
      trackingUrl={`${siteUrl}/tienda/rastrear`}
      logoUrl={logoUrl}
    />,
  )

  const resend = getResend()
  const { error } = await resend.emails.send({
    from: emailFrom,
    to: data.email,
    subject: `Tu pedido ${data.orderNumber} fue entregado`,
    html,
  })

  if (error) {
    console.error('sendOrderDelivered error:', error)
  }

  return { error }
}

export async function sendStockAvailable(data: StockAvailableData) {
  const logoUrl = await logoEmail()

  const html = await render(
    <StockAvailable
      customerName={data.customerName}
      productName={data.productName}
      productUrl={data.productUrl}
      comboLabel={data.comboLabel ?? null}
      logoUrl={logoUrl}
    />,
  )

  const resend = getResend()
  const { error } = await resend.emails.send({
    from: emailFrom,
    to: data.email,
    subject: `¡${data.productName}${data.comboLabel ? ` ${data.comboLabel}` : ''} volvió a estar disponible!`,
    html,
  })

  if (error) {
    console.error('sendStockAvailable error:', error)
  }

  return { error }
}

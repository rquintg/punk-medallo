import { Resend } from 'resend'
import { render } from '@react-email/components'
import OrderConfirmation from '@/emails/order-confirmation'
import OrderApproved from '@/emails/order-approved'
import OrderDeclined from '@/emails/order-declined'
import CartAbandoned from '@/emails/cart-abandoned'
import OrderPreparing from '@/emails/order-preparing'
import OrderShipped from '@/emails/order-shipped'
import OrderDelivered from '@/emails/order-delivered'
import StockAvailable from '@/emails/stock-available'
import { sitioUrl } from '@/lib/site-url'

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

export async function sendOrderApproved(data: OrderApprovedData) {
  const siteUrl = sitioUrl()

  const html = await render(
    <OrderApproved
      orderNumber={data.orderNumber}
      customerName={data.customerName}
      orderUrl={`${siteUrl}/tienda/orden/${data.orderNumber}`}
      trackingUrl={`${siteUrl}/tienda/rastrear`}
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
  const html = await render(
    <OrderDeclined
      orderNumber={data.orderNumber}
      customerName={data.customerName}
      reason={data.reason}
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

  const html = await render(
    <CartAbandoned
      orderNumber={data.orderNumber}
      customerName={data.customerName}
      items={data.items}
      total={data.total}
      siteUrl={siteUrl}
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

  const html = await render(
    <OrderPreparing
      orderNumber={data.orderNumber}
      customerName={data.customerName}
      trackingUrl={`${siteUrl}/tienda/rastrear`}
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

  const html = await render(
    <OrderShipped
      orderNumber={data.orderNumber}
      customerName={data.customerName}
      trackingUrl={`${siteUrl}/tienda/rastrear`}
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

  const html = await render(
    <OrderDelivered
      orderNumber={data.orderNumber}
      customerName={data.customerName}
      trackingUrl={`${siteUrl}/tienda/rastrear`}
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
  const html = await render(
    <StockAvailable
      customerName={data.customerName}
      productName={data.productName}
      productUrl={data.productUrl}
      comboLabel={data.comboLabel ?? null}
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

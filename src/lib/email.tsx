import { Resend } from 'resend'
import { render } from '@react-email/components'
import OrderConfirmation from '@/emails/order-confirmation'
import OrderApproved from '@/emails/order-approved'
import OrderDeclined from '@/emails/order-declined'
import CartAbandoned from '@/emails/cart-abandoned'

export interface OrderConfirmationData {
  orderNumber: string
  customerName: string
  email: string
  phone: string
  address: string
  city: string
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
  const html = await render(
    <OrderConfirmation
      orderNumber={data.orderNumber}
      customerName={data.customerName}
      email={data.email}
      phone={data.phone}
      address={data.address}
      city={data.city}
      items={data.items}
      total={data.total}
      estimatedDelivery={data.estimatedDelivery}
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
  const html = await render(
    <OrderApproved
      orderNumber={data.orderNumber}
      customerName={data.customerName}
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://punkmedallo.com'

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

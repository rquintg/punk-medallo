import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getTransaction } from '@/lib/wompi'
import { Breadcrumbs } from '@/components/tienda/breadcrumbs'
import RedirectTimer from './redirect-timer'
import ClearCart from './clear-cart'
import PollTransaction from './poll-transaction'

interface CompraPageProps {
  searchParams: Promise<{ id?: string }>
}

export const metadata: Metadata = {
  title: 'Compra',
  description:
    'Estado de tu compra en la tienda Punk Medallo.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: '/tienda/compra',
  },
  openGraph: {
    title: 'Compra - Punk Medallo',
    description:
      'Estado de tu compra en la tienda Punk Medallo.',
    url: '/tienda/compra',
    type: 'website',
    locale: 'es_CO',
    siteName: 'Punk Medallo',
    images: [
      {
        url: 'https://punkmedallo.com/logo_punk_medallo.jpg',
        width: 1200,
        height: 630,
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compra - Punk Medallo',
    description:
      'Estado de tu compra en la tienda Punk Medallo.',
    images: ['https://punkmedallo.com/logo_punk_medallo.jpg'],
  },
}

export default async function CompraPage({ searchParams }: CompraPageProps) {
  const { id: transactionId } = await searchParams

  if (!transactionId) {
    notFound()
  }

  let transaction
  try {
    transaction = await getTransaction(transactionId)
  } catch (err) {
    console.error('Error al obtener transacción:', err)
    transaction = null
  }

  if (!transaction) {
    return (
      <div>
        <Breadcrumbs
          segments={[
            { label: 'Tienda', href: '/tienda' },
            { label: 'Resultado del pago' },
          ]}
        />
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <AlertCircle size={48} className="text-red-500" />
          <h1 className="text-xl font-semibold text-white">
            Error al verificar el pago
          </h1>
          <p className="text-sm text-neutral-500">
            No pudimos obtener el estado de tu transacción. Revisá tu correo o contactanos.
          </p>
          <Link
            href="/tienda"
            className="mt-4 rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            Volver a la tienda
          </Link>
        </div>
      </div>
    )
  }

  const supabase = await createClient()

  const { data: pedido } = await supabase
    .from('pedidos')
    .select('numero_pedido')
    .eq('numero_pedido', transaction.reference)
    .single()

  const isApproved = transaction.status === 'APPROVED'
  const isPending = transaction.status === 'PENDING'
  const isDeclined = ['DECLINED', 'VOIDED', 'ERROR'].includes(transaction.status)

  let icon = <Clock size={48} className="text-yellow-500" />
  let title = 'Pago pendiente'
  let description = 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.'
  let linkUrl = '/cuenta/pedidos'

  if (isApproved) {
    icon = <CheckCircle size={48} className="text-green-500" />
    title = '¡Pago aprobado!'
    description = 'Tu pago fue procesado exitosamente. Te enviamos un correo con los detalles.'
    linkUrl = `/tienda/orden/${pedido?.numero_pedido ?? transaction.reference}`
  } else if (isPending) {
    icon = <Clock size={48} className="text-yellow-500" />
    title = 'Pago pendiente'
    description = 'Tu pago está siendo procesado. Esto puede tomar unos segundos.'
    linkUrl = '/cuenta/pedidos'
  } else if (isDeclined) {
    icon = <XCircle size={48} className="text-red-500" />
    title = 'Pago no procesado'
    description = 'El pago no pudo ser completado. Podés intentar nuevamente desde la tienda.'
    linkUrl = '/tienda'
  }

  return (
    <div>
      <div className="mb-6">
        <Breadcrumbs
          segments={[
            { label: 'Tienda', href: '/tienda' },
            { label: 'Resultado del pago' },
          ]}
        />
      </div>

      <ClearCart
        transactionId={transactionId}
        transactionStatus={transaction.status}
      />

      <div className="mt-16 flex flex-col items-center gap-4 text-center">
        {icon}
        <h1 className="text-xl font-semibold text-white">{title}</h1>
        <p className="max-w-md text-sm text-neutral-500">{description}</p>

        {(pedido || transaction) && (
          <p className="text-sm text-neutral-400">
            Pedido:{' '}
            <Link
              href={`/tienda/orden/${pedido?.numero_pedido ?? transaction.reference}`}
              className="font-medium text-red-500 hover:text-red-400"
            >
              {pedido?.numero_pedido ?? transaction.reference}
            </Link>
          </p>
        )}

        {isApproved && (pedido || transaction) && (
          <div className="mt-2">
            <RedirectTimer targetUrl={`/tienda/orden/${pedido?.numero_pedido ?? transaction.reference}`} />
          </div>
        )}

        {isPending && (
          <PollTransaction transactionId={transactionId} />
        )}

        {!isApproved && (
          <a
            href={linkUrl}
            className="mt-4 rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            {linkUrl === '/tienda' ? 'Volver a la tienda' : 'Ver mis pedidos'}
          </a>
        )}
      </div>
    </div>
  )
}

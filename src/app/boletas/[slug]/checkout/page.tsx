import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CheckoutBoletas from './checkout-boletas'
import { getEventoPublicoBySlug } from '@/features/boletas/services/public'

export const metadata: Metadata = {
  title: 'Pago de boletas',
  robots: { index: false, follow: false },
  alternates: { canonical: '/boletas' },
}

export default async function CheckoutBoletasPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const evento = await getEventoPublicoBySlug(slug)
  if (!evento) notFound()

  return (
    <div className="mx-auto max-w-7xl px-4 pt-20 pb-16">
      <CheckoutBoletas slug={slug} eventoTitulo={evento.titulo} eventoLugar={evento.lugar} />
    </div>
  )
}

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
    <div className="mx-auto max-w-3xl px-4 pt-20 pb-16">
      <h1 className="mb-1 text-2xl font-black uppercase italic tracking-wide text-white md:text-3xl">
        Pago de boletas
      </h1>
      <p className="mb-8 text-sm text-neutral-400">
        {evento.titulo} · {evento.lugar}
      </p>
      <CheckoutBoletas slug={slug} />
    </div>
  )
}

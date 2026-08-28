import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CalendarDays, Clock, MapPin, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getEventoPublicoBySlug, maximoComprable } from '@/features/boletas/services/public'
import { getProductosDestacados } from '@/features/tienda/services/products'
import { formatearFechaBoleta } from '@/features/boletas/format'
import { Breadcrumbs } from '@/components/tienda/breadcrumbs'
import CartDrawer from '@/components/tienda/cart-drawer'
import ProductCard from '@/components/tienda/product-card'
import Price from '@/components/tienda/price'
import ComprarPanel from './comprar-panel'
import BoletasGalleryClient from './boletas-gallery-client'

export const revalidate = 60

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const evento = await getEventoPublicoBySlug(slug)
  if (!evento) return { title: 'Evento no encontrado' }

  const ogImage = evento.imagenUrl ?? 'https://punkmedallo.com/logo_punk_medallo.jpg'
  const title = `${evento.titulo} — Boletas`
  const description = `${formatearFechaBoleta(evento.fechaEvento)} · ${evento.lugar}. Consigue tus boletas con QR único.`

  return {
    title,
    description,
    alternates: { canonical: `/boletas/${evento.slug}` },
    robots: { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: `/boletas/${evento.slug}`,
      type: 'website',
      locale: 'es_CO',
      siteName: 'Punk Medallo',
      images: [{ url: ogImage, width: 1200, height: 630, type: 'image/jpeg' }],
    },
  }
}

export default async function EventoBoletasPage({ params }: PageProps) {
  const { slug } = await params
  const [evento, supabase, destacados] = await Promise.all([
    getEventoPublicoBySlug(slug),
    createClient(),
    getProductosDestacados().catch(() => []),
  ])
  if (!evento) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const cupo = user ? await maximoComprable(user.id, evento) : null

  const imagenes = evento.imagenUrl ? [{ url: evento.imagenUrl, alt: evento.titulo, width: 800, height: 1066, color: null as string | null }] : []
  const desde = evento.tipos.filter((t) => t.disponibles > 0).reduce<number | null>((min, t) => (min === null || t.precio < min ? t.precio : min), null)

  return (
    <div className="mx-auto max-w-7xl px-4 pt-20 pb-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <Breadcrumbs
          segments={[
            { label: 'Boletas', href: '/boletas' },
            { label: evento.titulo },
          ]}
        />
        <CartDrawer />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <div className="w-full lg:w-3/5">
          {imagenes.length > 0 ? (
            <BoletasGalleryClient imagenes={imagenes as unknown as import('@/features/tienda/types').ProductImage[]} nombre={evento.titulo} />
          ) : (
            <div className="flex aspect-[3/4] w-full items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900">
              <CalendarDays size={48} className="text-neutral-700" />
            </div>
          )}
        </div>

        <div className="w-full lg:w-2/5">
          <h1 className="text-2xl font-bold text-white lg:text-3xl">{evento.titulo}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-400">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} className="text-[#dc2626]" />
              {formatearFechaBoleta(evento.fechaEvento)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} className="text-[#dc2626]" />
              {evento.lugar}
            </span>
            {evento.horaPuertas && (
              <span className="inline-flex items-center gap-1.5">
                <Clock size={14} className="text-neutral-500" />
                Puertas {evento.horaPuertas}
              </span>
            )}
          </p>

          {desde !== null && (
            <p className="mt-4 text-3xl font-bold text-white">
              Desde <Price amount={desde} />
            </p>
          )}

          {evento.descripcion && (
            <p className="mt-4 rounded-lg border border-neutral-800 bg-surface p-4 text-sm leading-relaxed text-neutral-300">
              {evento.descripcion}
            </p>
          )}

          {evento.edadMinima != null && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-md border border-amber-700/50 bg-amber-950/30 px-3 py-1.5 text-xs font-semibold text-amber-400">
              <ShieldCheck size={14} />
              Solo mayores de {evento.edadMinima} años
            </p>
          )}

          <div className="mt-6">
            <ComprarPanel
              slug={evento.slug}
              tipos={evento.tipos.map((t) => ({
                id: t.id,
                nombre: t.nombre,
                precio: t.precio,
                disponibles: t.disponibles,
              }))}
              maximos={cupo?.maximos ?? null}
              ya={cupo?.ya ?? 0}
              restante={cupo?.restante ?? 0}
            />
          </div>
        </div>
      </div>

      {destacados.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-bold text-white">Lleva tu merch al toque</h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {destacados.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CalendarDays, Clock, MapPin, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getEventoPublicoBySlug, maximoComprable } from '@/features/boletas/services/public'
import { formatearFecha } from '@/features/eventos/format'
import Price from '@/components/tienda/price'
import ComprarPanel from './comprar-panel'

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
  const description = `${formatearFecha(evento.fechaEvento)} · ${evento.lugar}. Consigue tus boletas con QR único.`

  return {
    title,
    description,
    alternates: { canonical: `/boletas/${evento.slug}` },
    robots: { index: false, follow: true }, // boletería sin lanzar públicamente
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
  const [evento, supabase] = await Promise.all([getEventoPublicoBySlug(slug), createClient()])
  if (!evento) notFound()

  // Sesión opcional para el panel: si hay usuario, límite acumulativo real;
  // si no, el CTA lleva a /login y el máximo se calcula tras autenticar.
  const { data: { user } } = await supabase.auth.getUser()
  const maximos = user ? await maximoComprable(user.id, evento) : undefined

  return (
    <div className="mx-auto max-w-5xl px-4 pt-20 pb-16">
      <Link
        href="/boletas"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-neutral-400 transition-colors hover:text-white"
      >
        <ArrowLeft size={15} />
        Todas las boletas
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        {/* Columna izquierda: portada + info del evento */}
        <div className="space-y-5">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
            {evento.imagenUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={evento.imagenUrl} alt={evento.titulo} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <CalendarDays size={48} className="text-neutral-700" />
              </div>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-black uppercase italic tracking-wide text-white md:text-3xl">
              {evento.titulo}
            </h1>
            <p className="mt-2 flex items-center gap-2 text-sm capitalize text-neutral-300">
              <CalendarDays size={16} className="shrink-0 text-[#dc2626]" />
              {formatearFecha(evento.fechaEvento)} ·{' '}
              {new Date(evento.fechaEvento).toLocaleTimeString('es-CO', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p className="mt-1.5 flex items-center gap-2 text-sm text-neutral-300">
              <MapPin size={16} className="shrink-0 text-[#dc2626]" />
              {evento.lugar}
            </p>
            {evento.horaPuertas && (
              <p className="mt-1.5 flex items-center gap-2 text-sm text-neutral-400">
                <Clock size={16} className="shrink-0 text-neutral-500" />
                Puertas: {evento.horaPuertas}
              </p>
            )}
          </div>

          {evento.descripcion && (
            <p className="text-sm leading-relaxed text-neutral-400">{evento.descripcion}</p>
          )}

          {evento.edadMinima != null && (
            <p className="inline-flex items-center gap-2 rounded-md border border-amber-700/50 bg-amber-950/30 px-3 py-1.5 text-xs font-semibold text-amber-400">
              <ShieldCheck size={14} />
              Evento para mayores de {evento.edadMinima} años
            </p>
          )}

          <p className="border-t border-neutral-800 pt-4 text-xs leading-relaxed text-neutral-500">
            Boleta digital con QR único a tu nombre. No reembolsable salvo cancelación del evento.
            Presenta tu QR en la puerta junto con tu documento de identidad.
          </p>
        </div>

        {/* Columna derecha: selección de boletas */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ComprarPanel
            slug={evento.slug}
            tipos={evento.tipos.map((t) => ({
              id: t.id,
              nombre: t.nombre,
              precio: t.precio,
              disponibles: t.disponibles,
            }))}
            maximos={maximos ?? null}
          />
        </div>
      </div>
    </div>
  )
}

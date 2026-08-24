import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarDays, MapPin, Ticket } from 'lucide-react'
import { listarEventosActivos } from '@/features/boletas/services/public'
import { formatearFecha } from '@/features/eventos/format'
import Price from '@/components/tienda/price'
import { ogImageActual } from '@/features/tienda/utils/seo'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await ogImageActual()
  return {
    title: 'Boletas y Conciertos',
    description:
      'Compra tus boletas para los conciertos de Punk Medallo. Pago seguro con Wompi, QR único por boleta.',
    alternates: { canonical: '/boletas' },
    openGraph: {
      title: 'Boletas y Conciertos - Punk Medallo',
      description: 'Consigue tus boletas para los próximos toques.',
      url: '/boletas',
      type: 'website',
      locale: 'es_CO',
      siteName: 'Punk Medallo',
      images: [{ url: ogImage, width: 1200, height: 630, type: 'image/jpeg' }],
    },
  }
}

const fechaCorta = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })

export default async function BoletasPage() {
  const eventos = await listarEventosActivos()

  return (
    <div className="mx-auto max-w-5xl px-4 pt-20 pb-16">
      <header className="mb-10 text-center">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.35em] text-[#dc2626]">
          Boletería
        </p>
        <h1 className="text-3xl font-black uppercase tracking-wide text-white md:text-4xl">
          Boletas y Conciertos
        </h1>
        <p className="mt-3 text-neutral-400">
          Consigue tu boleta con QR único. Pago seguro, sin filas.
        </p>
      </header>

      {eventos.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-neutral-800 bg-surface py-20 text-center">
          <Ticket size={44} className="text-neutral-600" />
          <div>
            <p className="font-semibold text-neutral-300">No hay boletas a la venta ahora</p>
            <p className="mt-1 text-sm text-neutral-500">
              Mantente atento — anunciamos los próximos conciertos aquí.
            </p>
          </div>
          <Link
            href="/eventos"
            className="text-sm font-medium text-red-500 underline underline-offset-4 hover:text-red-400"
          >
            Ver agenda de toques
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {eventos.map((e) => {
            // precio "desde": el más barato entre los tipos con disponibilidad
            const desde = e.tipos
              .filter((t) => t.disponibles > 0)
              .reduce<number | null>(
                (min, t) => (min === null || t.precio < min ? t.precio : min),
                null,
              )
            const agotado = e.tipos.every((t) => t.disponibles === 0)

            return (
              <Link
                key={e.id}
                href={`/boletas/${e.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-800 bg-surface transition-all duration-300 hover:border-[#a40202]/60 hover:shadow-lg hover:shadow-black/30"
              >
                <div className="relative aspect-[21/9] w-full overflow-hidden bg-neutral-900">
                  {e.imagenUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={e.imagenUrl}
                      alt={e.titulo}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <CalendarDays size={40} className="text-neutral-700" />
                    </div>
                  )}
                  {agotado && (
                    <span className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 text-lg font-black uppercase tracking-widest text-white">
                      Agotado
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h2 className="text-lg font-bold leading-tight text-white transition-colors group-hover:text-[#dc2626]">
                    {e.titulo}
                  </h2>

                  <p className="flex items-center gap-2 text-sm capitalize text-neutral-400">
                    <CalendarDays size={15} className="shrink-0 text-neutral-500" />
                    {fechaCorta(e.fechaEvento)}
                  </p>
                  <p className="flex items-center gap-2 text-sm text-neutral-400">
                    <MapPin size={15} className="shrink-0 text-neutral-500" />
                    {e.lugar}
                  </p>

                  <div className="mt-auto flex items-end justify-between pt-3">
                    <span className="text-xs uppercase tracking-wider text-neutral-500">
                      {e.tipos.length} tipo{e.tipos.length !== 1 ? 's' : ''}
                    </span>
                    {desde !== null ? (
                      <p className="text-right">
                        <span className="mr-1.5 text-xs text-neutral-500">Desde</span>
                        <span className="text-lg font-bold text-[#dc2626]">
                          <Price amount={desde} />
                        </span>
                      </p>
                    ) : (
                      <span className="text-sm font-semibold text-neutral-500">Sin cupo</span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

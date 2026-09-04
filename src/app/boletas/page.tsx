import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { CalendarDays, MapPin, Ticket } from 'lucide-react'
import { listarEventosActivos } from '@/features/boletas/services/public'
import Price from '@/components/tienda/price'
import { formatBogota } from '@/lib/format-bogota'
import { ogImageActual } from '@/features/tienda/utils/seo'
import CartDrawer from '@/components/tienda/cart-drawer'
import { BoletasFilters } from '@/components/boletas/boletas-filters'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const [{ boleteriaActiva }, ogImage] = await Promise.all([import('@/features/tienda/services/tienda-config').then((m) => m.getTiendaConfig()), ogImageActual()])
  return {
    title: 'La Boleteria - Punk Medallo',
    description:
      'Compra tus entradas para los conciertos de Punk Medallo.',
    alternates: { canonical: '/boletas' },
    robots: boleteriaActiva ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title: 'La Boleteria - Punk Medallo',
      description: 'Compra tus entradas para los conciertos de Punk Medallo.',
      url: '/boletas',
      type: 'website',
      locale: 'es_CO',
      siteName: 'Punk Medallo',
      images: [{ url: ogImage, width: 1200, height: 630, type: 'image/jpeg' }],
    },
  }
}

const fechaCorta = (iso: string) =>
  formatBogota(iso, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })

function mesLabel(value: string) {
  const [y, m] = value.split('-')
  const d = new Date(Number(y), Number(m) - 1, 1)
  return formatBogota(d.toISOString(), { month: 'short', year: 'numeric' })
}

export default async function BoletasPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const activeMes = typeof params.mes === 'string' ? params.mes : ''
  const activeLugar = typeof params.lugar === 'string' ? params.lugar : ''
  const disponiblesOnly = params.disponibles === '1'

  const eventos = await listarEventosActivos()

  // Opciones para filtros (derivadas de todos los eventos)
  const mesesMap = new Map<string, string>()
  const lugaresSet = new Set<string>()
  for (const e of eventos) {
    const key = e.fechaEvento.slice(0, 7)
    if (!mesesMap.has(key)) mesesMap.set(key, mesLabel(key))
    lugaresSet.add(e.lugar)
  }
  const meses = [...mesesMap.entries()].map(([value, label]) => ({ value, label })).sort((a, b) => a.value.localeCompare(b.value))
  const lugares = [...lugaresSet].sort((a, b) => a.localeCompare(b))

  // Filtrado server-side (seguridad + URL compartible, igual que /tienda)
  let filtrados = eventos
  if (activeMes) filtrados = filtrados.filter((e) => e.fechaEvento.slice(0, 7) === activeMes)
  if (activeLugar) filtrados = filtrados.filter((e) => e.lugar.toLowerCase() === activeLugar.toLowerCase())
  if (disponiblesOnly) filtrados = filtrados.filter((e) => e.tipos.some((t) => t.disponibles > 0))

  const hasFilters = !!activeMes || !!activeLugar || disponiblesOnly

  return (
    <div className="min-h-screen bg-[#181818]">
      {/* Hero negro como /blog y /eventos */}
      <section className="border-b border-neutral-800 bg-[#101010]">
        <div className="mx-auto max-w-6xl px-4 pt-24 pb-12 md:pt-28 md:pb-16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#dc2626]">Punk Medallo — Boletería</p>
              <h1 className="mt-3 text-7xl font-bold uppercase leading-none tracking-tight text-white md:text-7xl">
                La <span className="text-[#dc2626]">Boleteria</span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-400 md:text-base">
                Consigue tus entradas para los mejores eventos de las ciudad
              </p>
            </div>
            <div className="shrink-0">
              <CartDrawer />
            </div>
          </div>


        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="lg:flex lg:gap-8">
          <aside className="hidden w-[250px] shrink-0 lg:block">
            <div className="sticky top-24">
              <BoletasFilters meses={meses} lugares={lugares} />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                {hasFilters ? `Filtrados ${filtrados.length} de ${eventos.length}` : `${filtrados.length} evento${filtrados.length !== 1 ? 's' : ''}`}
              </p>
              <div className="lg:hidden">
                <BoletasFilters meses={meses} lugares={lugares} />
              </div>
            </div>

            {filtrados.length === 0 ? (
              <div className="flex flex-col items-center gap-4 rounded-xl border border-neutral-800 bg-[#101010] py-16 text-center">
                <Ticket size={44} className="text-neutral-600" />
                <div>
                  <p className="font-semibold text-neutral-300">
                    {hasFilters ? 'No hay resultados con esos filtros' : 'No hay boletas a la venta ahora'}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {hasFilters ? 'Prueba limpiando o cambiando los filtros.' : 'Mantente atento — anunciamos los próximos conciertos aquí.'}
                  </p>
                </div>
                {hasFilters ? (
                  <Link href="/boletas" className="text-sm font-medium text-red-500 underline underline-offset-4 hover:text-red-400">
                    Limpiar filtros
                  </Link>
                ) : (
                  <Link href="/eventos" className="text-sm font-medium text-red-500 underline underline-offset-4 hover:text-red-400">
                    Ver agenda de toques
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {filtrados.map((e) => {
                  const desde = e.tipos
                    .filter((t) => t.disponibles > 0)
                    .reduce<number | null>((min, t) => (min === null || t.precio < min ? t.precio : min), null)
                  const agotado = e.tipos.every((t) => t.disponibles === 0)
                  const dia = formatBogota(e.fechaEvento, { day: 'numeric' })
                  const mes = formatBogota(e.fechaEvento, { month: 'short' })

                  return (
                    <Link
                      key={e.id}
                      href={`/boletas/${e.slug}`}
                      className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-800 bg-[#101010] transition-all duration-300 hover:border-[#a40202]/60 hover:shadow-lg hover:shadow-black/30 hover:-translate-y-1"
                    >
                       <div className="relative aspect-square w-full overflow-hidden rounded-t-xl bg-neutral-900">
                        {(e.imagenCardUrl ?? e.imagenUrl) ? (
                          <Image
                            src={(e.imagenCardUrl ?? e.imagenUrl)!}
                            alt={e.titulo}
                            width={800}
                            height={800}
                            unoptimized
                            className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <CalendarDays size={40} className="text-neutral-700" />
                          </div>
                        )}
                        <div className="absolute left-3 top-3 flex flex-col items-center rounded-lg bg-white px-2.5 py-1.5 text-center shadow-md">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-red-600">{mes}</span>
                          <span className="text-xl font-black leading-none text-black">{dia}</span>
                        </div>
                        {agotado && (
                          <span className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 text-lg font-black uppercase tracking-widest text-white">
                            Agotado
                          </span>
                        )}
                      </div>

                      <div className="h-px w-full bg-neutral-800" />

                      <div className="flex flex-1 flex-col gap-2 p-5">
                        <h2 className="text-lg font-bold leading-tight text-white transition-colors group-hover:text-[#dc2626]">{e.titulo}</h2>
                        <p className="flex items-center gap-2 text-sm capitalize text-neutral-400">
                          <CalendarDays size={15} className="shrink-0 text-neutral-500" />
                          {fechaCorta(e.fechaEvento)}
                        </p>
                        <p className="flex items-center gap-2 text-sm text-neutral-400">
                          <MapPin size={15} className="shrink-0 text-neutral-500" />
                          {e.lugar}
                        </p>
                        <div className="mt-auto flex items-end justify-between pt-3">
                          <span className="rounded-full bg-neutral-900 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                            {e.tipos.length} tipo{e.tipos.length !== 1 ? 's' : ''}
                          </span>
                          {desde !== null ? (
                            <span className="rounded-full bg-[#dc2626] px-3 py-1 text-xs font-bold text-white">
                              Desde <Price amount={desde} />
                            </span>
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
        </div>
      </main>
    </div>
  )
}

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface BoletaCard {
  id: string
  slug: string
  titulo: string
  lugar: string
  imagenCardUrl?: string | null
  imagenUrl?: string | null
}

interface BoleteriaHomeProps {
  eventos: BoletaCard[]
}

export default function BoleteriaHome({ eventos }: BoleteriaHomeProps) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = eventos.length
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goTo = useCallback((i: number) => setActive(((i % count) + count) % count), [count])
  const step = useCallback((d: 1 | -1) => setActive((c) => ((c + d) % count + count) % count), [count])

  useEffect(() => {
    if (count < 2 || paused) return
    timerRef.current = setInterval(() => setActive((c) => (c + 1) % count), 5000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [count, paused])

  if (count === 0) return null

  const Card = ({ e }: { e: BoletaCard }) => {
    const src = e.imagenCardUrl ?? e.imagenUrl
    return (
      <Link href={`/boletas/${e.slug}`} className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur hover:border-primary/40 transition-all">
        <div className="relative aspect-square overflow-hidden bg-neutral-900">
          {src ? (
            <Image src={src} alt={e.titulo} width={800} height={800} unoptimized className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
          ) : (
            <div className="flex h-full items-center justify-center text-neutral-600">Sin flyer</div>
          )}
        </div>
        <div className="p-3">
          <p className="truncate text-sm font-black text-white group-hover:text-primary">{e.titulo}</p>
          <p className="truncate text-xs text-muted-foreground">{e.lugar}</p>
        </div>
      </Link>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-black uppercase tracking-tight"><span className="text-white">Boletería</span> <span className="text-primary">en venta</span></h2>
        <div className="flex items-center gap-2">
          <Link href="/boletas" className="hidden text-xs font-bold uppercase tracking-widest text-primary hover:underline sm:inline">Ver todo →</Link>
          {count > 1 && (
            <div className="flex items-center gap-2 sm:hidden">
              <button type="button" onClick={() => step(-1)} aria-label="Anterior" className="flex h-8 w-8 items-center justify-center rounded border border-neutral-700 bg-surface text-neutral-300 hover:border-primary hover:text-white">
                <ChevronLeft size={16} />
              </button>
              <button type="button" onClick={() => step(1)} aria-label="Siguiente" className="flex h-8 w-8 items-center justify-center rounded border border-neutral-700 bg-surface text-neutral-300 hover:border-primary hover:text-white">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* desktop grid */}
      <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4">
        {eventos.slice(0, 4).map((e) => (
          <Card key={e.id} e={e} />
        ))}
      </div>

      {/* mobile carousel */}
      <div className="sm:hidden" onTouchStart={() => setPaused(true)} onTouchEnd={() => setPaused(false)} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="overflow-hidden rounded-xl">
          {eventos.slice(0, 4).map((e, i) => (
            <div key={e.id} className={i === active ? 'block' : 'hidden'}>
              <Card e={e} />
            </div>
          ))}
        </div>
        {count > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            {eventos.slice(0, 4).map((_, i) => (
              <button key={i} type="button" onClick={() => goTo(i)} aria-label={`Ir a ${i + 1}`} className={`h-1.5 rounded-full transition-all ${i === active ? 'w-6 bg-primary' : 'w-3 bg-neutral-700'}`} />
            ))}
          </div>
        )}
        <Link href="/boletas" className="mt-4 block text-center text-xs font-bold uppercase tracking-widest text-primary hover:underline">
          Ver todo →
        </Link>
      </div>
    </div>
  )
}

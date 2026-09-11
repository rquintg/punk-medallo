'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductoHomeCard from './producto-home-card'
import type { Producto } from '@/features/tienda/types'
import Link from 'next/link'

export default function ProductosHome({ productos }: { productos: Producto[] }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = productos.length
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goTo = useCallback((i: number) => setActive(((i % count) + count) % count), [count])
  const step = useCallback((d: 1 | -1) => setActive((c) => ((c + d) % count + count) % count), [count])

  useEffect(() => {
    if (count < 2 || paused) return
    timerRef.current = setInterval(() => setActive((c) => (c + 1) % count), 5000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [count, paused])

  if (count === 0) return null
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-black uppercase tracking-tight"><span className="text-white">Lo más</span> <span className="text-primary">pedido</span></h2>
        <div className="flex items-center gap-2">
          <Link href="/tienda" className="hidden text-xs font-bold uppercase tracking-widest text-primary hover:underline sm:inline">
            Ver tienda →
          </Link>
          {/* mobile controls */}
          <div className="flex items-center gap-2 sm:hidden">
            <button type="button" onClick={() => step(-1)} aria-label="Anterior" className="flex h-8 w-8 items-center justify-center rounded border border-neutral-700 bg-surface text-neutral-300 hover:border-primary hover:text-white">
              <ChevronLeft size={16} />
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Siguiente" className="flex h-8 w-8 items-center justify-center rounded border border-neutral-700 bg-surface text-neutral-300 hover:border-primary hover:text-white">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* desktop grid */}
      <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4">
        {productos.map((p, i) => (
          <ProductoHomeCard key={p.id} producto={p} index={i} />
        ))}
      </div>

      {/* mobile carousel - 1 card at a time */}
      <div className="sm:hidden" onTouchStart={() => setPaused(true)} onTouchEnd={() => setPaused(false)} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="overflow-hidden rounded-xl">
          {productos.map((p, i) => (
            <div key={p.id} className={i === active ? 'block' : 'hidden'}>
              <ProductoHomeCard producto={p} index={0} />
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center gap-2">
          {productos.map((_, i) => (
            <button key={i} type="button" onClick={() => goTo(i)} aria-label={`Ir a ${i + 1}`} className={`h-1.5 rounded-full transition-all ${i === active ? 'w-6 bg-primary' : 'w-3 bg-neutral-700'}`} />
          ))}
        </div>
        <Link href="/tienda" className="mt-4 block text-center text-xs font-bold uppercase tracking-widest text-primary hover:underline">
          Ver tienda →
        </Link>
      </div>
    </div>
  )
}

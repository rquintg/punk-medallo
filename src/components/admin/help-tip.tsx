'use client'

import { useEffect, useRef, useState } from 'react'
import { CircleHelp } from 'lucide-react'

interface HelpTipProps {
  help: string
  label: string
}

const ANCHO_TOOLTIP = 256

export default function HelpTip({ help, label }: HelpTipProps) {
  const [abierto, setAbierto] = useState(false)
  const [hover, setHover] = useState(false)
  const [pos, setPos] = useState<{ left: number; top: number; arriba: boolean } | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  const visible = hover || abierto

  useEffect(() => {
    if (!visible) {
      setPos(null)
      return
    }
    const medir = () => {
      const r = ref.current?.getBoundingClientRect()
      if (!r) return
      const left = Math.min(
        Math.max(8, r.left),
        window.innerWidth - ANCHO_TOOLTIP - 8,
      )
      const arriba = r.bottom + 8 + 120 > window.innerHeight
      const top = arriba ? r.top - 8 : r.bottom + 8
      setPos({ left, top, arriba })
    }
    medir()
    window.addEventListener('resize', medir)
    window.addEventListener('scroll', medir, true)
    return () => {
      window.removeEventListener('resize', medir)
      window.removeEventListener('scroll', medir, true)
    }
  }, [visible])

  useEffect(() => {
    if (!abierto) return
    const cerrar = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false)
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false)
    }
    document.addEventListener('mousedown', cerrar)
    document.addEventListener('touchstart', cerrar)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', cerrar)
      document.removeEventListener('touchstart', cerrar)
      document.removeEventListener('keydown', onEsc)
    }
  }, [abierto])

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        aria-label={`Qué mide ${label}`}
        aria-expanded={abierto}
        onClick={() => setAbierto((v) => !v)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="flex h-4 w-4 items-center justify-center rounded-full text-[var(--admin-text-dim)] transition-colors hover:text-[var(--admin-accent)]"
      >
        <CircleHelp size={14} />
      </button>
      {visible && pos && (
        <div
          role="tooltip"
          style={{
            left: pos.left,
            top: pos.top,
            transform: pos.arriba ? 'translateY(-100%)' : undefined,
          }}
          className="fixed z-50 w-64 max-w-[calc(100vw-1rem)] rounded-lg border border-neutral-700 bg-neutral-900/95 px-3 py-2 text-xs leading-relaxed text-neutral-100 shadow-xl"
        >
          {help}
        </div>
      )}
    </div>
  )
}
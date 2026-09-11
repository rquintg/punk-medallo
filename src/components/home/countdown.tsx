'use client'

import { useEffect, useState } from 'react'
import { fechaDesdeISO } from '@/features/eventos/format'

interface CountdownProps {
  iso: string | null
}

function diff(targetIso: string | null): string | null {
  if (!targetIso) return null
  const parsed = fechaDesdeISO(targetIso)
  const t = parsed ? parsed.getTime() : new Date(targetIso).getTime()
  if (Number.isNaN(t)) return null
  const now = Date.now()
  const ms = t - now
  if (ms <= 0) return '¡Hoy!'
  const d = Math.floor(ms / 86_400_000)
  const h = Math.floor((ms % 86_400_000) / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  if (d > 0) return `${d}d ${h}h`
  return `${h}h ${m}m`
}

export default function Countdown({ iso }: CountdownProps) {
  const [label, setLabel] = useState(() => diff(iso))
  useEffect(() => {
    if (!iso) return
    const id = setInterval(() => setLabel(diff(iso)), 60_000)
    return () => clearInterval(id)
  }, [iso])
  if (!label) return null
  return <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-black text-white">{label}</span>
}

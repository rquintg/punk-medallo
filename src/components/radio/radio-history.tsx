'use client'

import Image from 'next/image'
import { Clock, Music } from 'lucide-react'
import type { HistoryTrack } from '@/hooks/useCurrentTrack'

interface RadioHistoryProps {
  history: HistoryTrack[]
}

function formatTime(ts?: number): string {
  if (!ts) return ''
  const d = new Date(ts * 1000)
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota' })
}

export default function RadioHistory({ history }: RadioHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
        <Music size={24} className="mx-auto text-muted-foreground/60" />
        <p className="mt-2 text-sm font-bold text-white">Aún no hay historial</p>
        <p className="text-xs text-muted-foreground">Las últimas canciones aparecerán aquí.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur">
      <div className="border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
        <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white">
          <Clock size={14} className="text-primary" /> Sonó hace poco
        </h3>
      </div>
      <ul className="divide-y divide-white/[0.04]">
        {history.map((t, i) => (
          <li key={`${t.title}-${t.artist}-${i}`} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03]">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-neutral-900">
              {t.art ? (
                <Image src={t.art} alt={t.title} fill unoptimized className="object-cover" sizes="48px" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-background">
                  <Music size={16} className="text-primary/50" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate text-sm font-bold leading-tight text-white">
                <span className="truncate">{t.title}</span>
                {t.isRequest && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/30">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Pedida
                  </span>
                )}
              </p>
              <p className="truncate text-xs text-muted-foreground">{t.artist}</p>
            </div>
            {t.playedAt && <span className="shrink-0 text-xs font-mono text-muted-foreground">{formatTime(t.playedAt)}</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}

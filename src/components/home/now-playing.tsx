'use client'

import { Play } from 'lucide-react'
import Link from 'next/link'
import useCurrentTrack from '@/hooks/useCurrentTrack'
import AudioVisualizer from './audio-visualizer'

export default function NowPlaying() {
  const { currentTrack, isLoading, isStationOnline } = useCurrentTrack()
  const offline = !isStationOnline

  return (
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${offline ? 'border-white/5 bg-white/[0.02] grayscale' : 'border-neutral-800 bg-surface'}`}>
      <div className="min-w-0 flex-1">
        <div className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest ${offline ? 'text-muted-foreground' : 'text-primary'}`}>
          {offline ? 'Radio offline' : 'Radio en vivo'} <AudioVisualizer active={!offline && !isLoading && !!currentTrack} />
          {offline && <span className="rounded-full bg-red-500/15 px-1.5 py-0.5 text-[10px] text-red-400">Offline</span>}
        </div>
        {isLoading ? (
          <p className="text-sm italic text-neutral-500">Cargando…</p>
        ) : currentTrack ? (
          <>
            <p className="flex items-center gap-2 truncate text-sm font-bold text-white">
              <span className="truncate">{currentTrack.title}</span>
              {currentTrack.isRequest && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Pedida
                </span>
              )}
            </p>
            <p className="truncate text-xs text-neutral-500">{currentTrack.artist}</p>
          </>
        ) : (
          <p className="text-sm italic text-neutral-500">Sin información</p>
        )}
      </div>
      <Link href="/radio" className="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-black hover:bg-neutral-200">
        <span className="hidden sm:inline">Escuchar</span>
        <Play size={14} className="sm:hidden" />
      </Link>
    </div>
  )
}

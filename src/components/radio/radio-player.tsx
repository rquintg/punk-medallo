'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Play, Pause, Volume2, Radio, Wifi } from 'lucide-react'
import { STREAM_URL } from '@/lib/azuracast'
import type { Track } from '@/hooks/useCurrentTrack'

interface RadioPlayerProps {
  currentTrack: Track | null
  nextTrack: Track | null
  isLoading: boolean
}

export default function RadioPlayer({ currentTrack, nextTrack, isLoading }: RadioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [isOnline, setIsOnline] = useState(true)
  const [showNext, setShowNext] = useState(false)
  const togglePlayRef = useRef<(() => void) | null>(null)
  const lastMetaKeyRef = useRef<string | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onPlaying = () => setIsOnline(true)
    const onCanPlay = () => setIsOnline(true)
    const onError = () => setIsOnline(false)
    const onEnded = () => setIsPlaying(false)
    audio.addEventListener('playing', onPlaying)
    audio.addEventListener('canplay', onCanPlay)
    audio.addEventListener('error', onError)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('playing', onPlaying)
      audio.removeEventListener('canplay', onCanPlay)
      audio.removeEventListener('error', onError)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  useEffect(() => {
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  useEffect(() => {
    const id = setInterval(() => setShowNext((p) => !p), 7000)
    return () => clearInterval(id)
  }, [])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused'
      return
    }
    try {
      if (audio.src !== STREAM_URL) audio.src = STREAM_URL
      await audio.play()
      setIsPlaying(true)
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing'
    } catch {
      setIsOnline(false)
    }
  }

  useEffect(() => {
    togglePlayRef.current = togglePlay
  })

  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    const actionHandler = (action: MediaSessionAction, handler: MediaSessionActionHandler | null) => {
      try { navigator.mediaSession.setActionHandler(action, handler as unknown as MediaSessionActionHandler) } catch {}
    }
    actionHandler('play', () => togglePlayRef.current?.())
    actionHandler('pause', () => togglePlayRef.current?.())
    return () => {
      actionHandler('play', null)
      actionHandler('pause', null)
    }
  }, [])

  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    const track = showNext && nextTrack ? nextTrack : currentTrack
    if (!track || isLoading) return
    const key = `${track.title}|${track.artist}|${track.album ?? ''}|${track.art ?? ''}`
    if (lastMetaKeyRef.current === key) return
    lastMetaKeyRef.current = key
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album ?? 'Punk Medallo — Radio 24/7',
        artwork: track.art ? [{ src: track.art, sizes: '512x512', type: 'image/jpeg' }] : [{ src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }],
      })
    } catch {}
  }, [currentTrack, nextTrack, showNext, isLoading])

  const displayTrack = showNext && nextTrack ? nextTrack : currentTrack
  const label = showNext && nextTrack ? 'A continuación' : 'Suena ahora'

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur">
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
        <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary shadow-[0_0_8px_rgba(220,38,38,0.8)]" /> {label}
        </span>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${isOnline ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
          <Wifi size={12} /> {isOnline ? 'En vivo' : 'Offline'}
        </span>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex gap-4">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-neutral-900 sm:h-32 sm:w-32">
            {displayTrack?.art ? (
              <Image src={displayTrack.art} alt={displayTrack.title} fill unoptimized className="object-cover" sizes="128px" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-background">
                <Radio size={28} className="text-primary/60" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            {isLoading ? (
              <p className="animate-pulse text-sm text-muted-foreground">Cargando…</p>
            ) : displayTrack ? (
              <>
                <p className="flex items-center gap-2 truncate text-base font-black leading-tight text-white sm:text-lg">
                  <span className="truncate">{displayTrack.title}</span>
                  {displayTrack.isRequest && (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/30">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" /> Pedida
                    </span>
                  )}
                </p>
                <p className="truncate text-sm text-muted-foreground">{displayTrack.artist}</p>
                {displayTrack.album && <p className="mt-1 truncate text-xs text-muted-foreground/70">{displayTrack.album}</p>}
                {!isLoading && nextTrack && (
                  <button type="button" onClick={() => setShowNext((v) => !v)} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
                    {showNext ? 'Ver ahora' : 'Ver siguiente'}
                  </button>
                )}
              </>
            ) : (
              <p className="text-sm italic text-muted-foreground">Sin información</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-[0_4px_16px_rgba(220,38,38,0.4)] hover:bg-primary-hover"
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-white/60">{isPlaying ? 'Reproduciendo' : 'Pausado'}</p>
            <p className="truncate text-xs text-muted-foreground">punkmedallo.com/radio • MP3 192k</p>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <Volume2 size={16} className="text-muted-foreground" />
            <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="h-1 w-24 accent-primary" aria-label="Volumen" />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 sm:hidden">
          <Volume2 size={14} className="text-muted-foreground" />
          <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="h-1 flex-1 accent-primary" aria-label="Volumen" />
        </div>
      </div>

      <audio ref={audioRef} preload="none" crossOrigin="anonymous" className="hidden" />
    </div>
  )
}

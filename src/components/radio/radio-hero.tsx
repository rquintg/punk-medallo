'use client'

import Image from 'next/image'
import { LOGO_DEFAULT } from '@/features/tienda/services/tienda-config'
import useCurrentTrack from '@/hooks/useCurrentTrack'

interface RadioHeroProps {
  logoUrl: string | null
}

export default function RadioHero({ logoUrl }: RadioHeroProps) {
  const { isStationOnline } = useCurrentTrack()
  const offline = !isStationOnline

  return (
    <section className={`border-b bg-background ${offline ? 'border-white/5' : 'border-white/[0.06]'}`}>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-24 pb-10 md:pt-28 md:pb-12 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className={`font-mono text-xs uppercase tracking-[0.3em] ${offline ? 'text-muted-foreground' : 'text-primary'}`}>Punk Medallo — {offline ? 'Offline' : 'En vivo'}</p>
          <h1 className="mt-3 text-5xl font-black uppercase leading-none tracking-tight md:text-7xl">
            <span className={offline ? 'text-white/60' : 'text-white'}>Radio</span> <span className={offline ? 'text-muted-foreground' : 'text-primary'}>{offline ? 'Offline' : '24/7'}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {offline ? 'La radio está fuera del aire. Volvemos pronto — las solicitudes y la reproducción están pausadas.' : 'Puro punk, hardcore y alternativo sin pausa. Escucha lo que suena ahora, descubre lo que sonó hace poco y pide tu canción.'}
          </p>
        </div>
        <div className={`relative aspect-[2/1] w-full max-w-[320px] shrink-0 self-center lg:self-auto ${offline ? 'grayscale opacity-60' : ''}`}>
          <Image src={logoUrl ?? LOGO_DEFAULT} alt="Punk Medallo" fill priority sizes="320px" className="object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]" />
          {offline && <div className="pointer-events-none absolute inset-0 bg-black/20" />}
        </div>
      </div>
    </section>
  )
}

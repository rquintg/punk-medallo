'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MessageSquare, Send, Mail, Zap } from 'lucide-react'
import useCurrentTrack from '@/hooks/useCurrentTrack'
import RadioPlayer from '@/components/radio/radio-player'
import RadioHistory from '@/components/radio/radio-history'
import SongRequest from '@/components/SongRequest'

export default function RadioClient() {
  const { currentTrack, nextTrack, history, isLoading } = useCurrentTrack()
  const [isRequestOpen, setIsRequestOpen] = useState(false)

  return (
    <div className="grid gap-6 lg:grid-cols-[1.45fr_0.9fr]">
      {/* Móvil: Pide tu canción primero */}
      <div className="lg:hidden">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-5">
          <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white">
            <MessageSquare size={14} className="text-primary" /> Pide tu canción
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">Puedes pedir la misma canción cada 5 minutos.</p>
          <button type="button" onClick={() => setIsRequestOpen(true)} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-black uppercase tracking-widest text-white hover:bg-primary-hover">
            <Send size={16} /> Abrir solicitudes
          </button>
          <p className="mt-2 text-center text-xs text-muted-foreground/70">El tiempo para que suene tu solicitud es menor a 10 minutos.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-6 lg:block">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
            <Zap size={14} /> Punk Medallo Radio
          </div>
          <h2 className="mt-2 text-2xl font-black leading-tight text-white">¿Tienes una banda?</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Escríbenos para aparecer en el blog y te escuchen en la radio.</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <a href="mailto:info@punkmedallo.com" className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
              <Mail size={12} /> info@punkmedallo.com
            </a>
            <Link href="/contacto" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-primary-hover">
              Ir a contacto
            </Link>
          </div>
        </div>

        <div className="lg:sticky lg:top-24">
          <RadioPlayer currentTrack={currentTrack} nextTrack={nextTrack} isLoading={isLoading} />
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs leading-relaxed text-muted-foreground">
            <span className="font-bold text-white">Tip:</span> deja la pestaña o la app abierta — el reproductor sigue <code className="rounded bg-white/10 px-1">Funcionando</code> incluso con la pantalla bloqueada.
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-5 lg:block">
          <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white">
            <MessageSquare size={14} className="text-primary" /> Pide tu canción
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">Puedes pedir la misma canción cada 5 minutos.</p>
          <button type="button" onClick={() => setIsRequestOpen(true)} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-black uppercase tracking-widest text-white hover:bg-primary-hover">
            <Send size={16} /> Abrir solicitudes
          </button>
          <p className="mt-2 text-center text-xs text-muted-foreground/70">El tiempo para que suene tu solicitud es menor a 10 minutos.</p>
        </div>

        <RadioHistory history={history} />

        {/* Móvil: ¿Tienes una banda? debajo del historial */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-6 lg:hidden">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
            <Zap size={14} /> Punk Medallo Radio
          </div>
          <h2 className="mt-2 text-2xl font-black leading-tight text-white">¿Tienes una banda?</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Escríbenos para aparecer en el blog y te escuchen en la radio.</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <a href="mailto:info@punkmedallo.com" className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
              <Mail size={12} /> info@punkmedallo.com
            </a>
            <Link href="/contacto" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-primary-hover">
              Ir a contacto
            </Link>
          </div>
        </div>
      </div>

      <SongRequest isOpen={isRequestOpen} onClose={() => setIsRequestOpen(false)} />
    </div>
  )
}

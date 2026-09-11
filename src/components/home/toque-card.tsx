'use client'

import { motion } from 'framer-motion'
import { MapPin, Clock, Ticket, CalendarPlus } from 'lucide-react'
import Link from 'next/link'
import Countdown from './countdown'
import type { Evento } from '@/features/eventos/types'
import { formatearFecha, formatearHora, formatearPrecio } from '@/features/eventos/format'
import { googleCalendarUrl } from '@/features/eventos/add-to-calendar'

interface ToqueCardProps {
  evento: Evento
  index?: number
}

export default function ToqueCard({ evento, index = 0 }: ToqueCardProps) {
  const fechaLabel = evento.fecha ? formatearFecha(evento.fecha) : null
  const horaLabel = evento.horaInicio ? formatearHora(evento.horaInicio) : null
  const precioLabel = formatearPrecio(evento)
  const calendarUrl = googleCalendarUrl(evento)

  const handleCalendar = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (calendarUrl) window.open(calendarUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ delay: index * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[460px]"
    >
      <div className="group relative flex min-h-[132px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur hover:border-primary/40 hover:bg-white/[0.06] transition-all">
        <div className="absolute right-3 top-3 z-20">
          <Countdown iso={evento.fecha ?? null} />
        </div>
        {/* thumb */}
        <Link href="/eventos" className="relative w-[132px] shrink-0 overflow-hidden bg-neutral-900 sm:w-[148px]">
          {evento.flyer ? (
            <img src={evento.flyer} alt={evento.titulo} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]" loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-background">
              <Ticket size={22} className="text-primary/60" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        </Link>

        {/* content */}
        <div className="flex min-w-0 flex-1 flex-col p-3.5 sm:p-4">
          <Link href="/eventos" className="line-clamp-2 text-[15px] font-black leading-tight text-white group-hover:text-primary transition-colors">
            {evento.titulo}
          </Link>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            {evento.lugar && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={12} className="text-primary/70" /> <span className="truncate max-w-[14ch] sm:max-w-[18ch]">{evento.lugar}</span>
              </span>
            )}
            {fechaLabel && <span className="inline-flex items-center gap-1.5"><Clock size={12} className="text-primary/70" />{fechaLabel}{horaLabel ? ` · ${horaLabel}` : ''}</span>}
          </div>

          <div className="mt-auto flex items-center gap-2 pt-3">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-widest ${precioLabel ? 'bg-primary text-white' : 'bg-white/10 text-white/70'}`}>
              {precioLabel ?? 'Entrada libre'}
            </span>
            {calendarUrl && (
              <button
                type="button"
                onClick={handleCalendar}
                className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[11px] font-bold text-white/80 hover:border-primary hover:bg-primary hover:text-white transition-colors"
                aria-label="Agregar al calendario"
                title="Agregar al calendario"
              >
                <CalendarPlus size={12} /> Calendario
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

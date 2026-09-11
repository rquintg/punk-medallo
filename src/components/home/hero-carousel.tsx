'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { LOGO_DEFAULT } from '@/features/tienda/services/tienda-config'
import NowPlaying from './now-playing'

const LOCAL_HERO = [
  { id: 'hero-1', src: '/images/hero/hero-1.jpeg', alt: 'Pogo en el Carlos Vieco — Punk Medallo' },
]

interface HeroCarouselProps {
  logoUrl?: string | null
}

export default function HeroCarousel({ logoUrl }: HeroCarouselProps) {
  const slides = LOCAL_HERO
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => setIndex((i) => (i + 1) % slides.length), [slides.length])
  const prev = useCallback(() => setIndex((i) => (i - 1 + slides.length) % slides.length), [slides.length])

  useEffect(() => {
    if (paused || slides.length < 2) return
    const id = setInterval(next, 6000)
    return () => clearInterval(id)
  }, [paused, next, slides.length])

  const foto = slides[index]

  return (
    <section
      className="relative w-screen ml-[calc(-50vw+50%)] h-[100vh] min-h-[540px] overflow-hidden bg-black"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={foto.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
        >
          <Image src={foto.src} alt={foto.alt} fill priority sizes="100vw" fetchPriority="high" className="object-cover grayscale" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent via-black/35 to-background" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute left-1/2 top-[14%] w-[78%] max-w-[420px] -translate-x-1/2 aspect-[2/1] md:top-[10%] md:w-[440px]">
        <Image src={logoUrl ?? LOGO_DEFAULT} alt="Punk Medallo" fill priority sizes="440px" className="object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.9)]" />
      </div>
      <div className="absolute bottom-[18%] left-1/2 w-full max-w-2xl -translate-x-1/2 px-6 text-center md:bottom-[20%]">
        <h1 className="animate-hero-rise text-3xl font-black uppercase leading-none tracking-tight md:text-5xl">
          <span className="text-white">Punk</span> <span className="text-primary">Medallo</span>
        </h1>
        <p className="animate-hero-rise-2 mt-2 text-sm font-medium tracking-[0.18em] uppercase text-white md:text-base">
          Ruido <span className="text-primary">—</span> Memoria <span className="text-primary">—</span> Calle
        </p>
        <p className="animate-hero-rise-3 mx-auto mt-2 max-w-xl text-xs leading-relaxed text-white/60 md:text-sm">
          Archivo vivo del punk de Medellín. Descargas, fotos, toques y tienda — todo en un solo lugar.
        </p>
      </div>

      <div className="animate-hero-rise-3 absolute bottom-[4%] left-1/2 w-full max-w-2xl -translate-x-1/2 px-6 md:bottom-[4%]">
        <NowPlaying />
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3">
          <button onClick={prev} aria-label="Anterior" className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur hover:bg-white/10">
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setIndex(i)} aria-label={`Ir a slide ${i + 1}`} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-primary' : 'w-1.5 bg-white/40'}`} />
            ))}
          </div>
          <button onClick={next} aria-label="Siguiente" className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur hover:bg-white/10">
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </section>
  )
}

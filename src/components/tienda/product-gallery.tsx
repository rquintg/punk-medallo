'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { ProductImage } from '@/features/tienda/types';

interface ProductGalleryProps {
  imagenes: ProductImage[];
  nombre: string;
  selectedColor?: string | null;
  imageIndex: number;
  onImageChange: (index: number) => void;
  aspect?: 'square' | 'portrait';
}

export function ProductGallery({ imagenes, nombre, selectedColor, imageIndex, onImageChange, aspect = 'square' }: ProductGalleryProps) {
  const filtered = useMemo(() => {
    if (!selectedColor) return imagenes
    const color = imagenes.filter((i) => i.color === selectedColor)
    const rest = imagenes.filter((i) => !i.color)
    if (color.length === 0) return imagenes
    return [...color, ...rest]
  }, [imagenes, selectedColor])

  const index = Math.min(Math.max(imageIndex, 0), filtered.length - 1);
  const prevIndex = index > 0 ? index - 1 : filtered.length - 1;
  const nextIndex = index < filtered.length - 1 ? index + 1 : 0;
  const [lightbox, setLightbox] = useState(false)
  const [zoom, setZoom] = useState(false)
  const touchX = useRef(0)

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false)
      if (e.key === 'ArrowLeft') onImageChange(prevIndex)
      if (e.key === 'ArrowRight') onImageChange(nextIndex)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [lightbox, prevIndex, nextIndex, onImageChange])

  function onTouchStart(e: React.TouchEvent) { touchX.current = e.touches[0].clientX }
  function onTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchX.current
    if (Math.abs(dx) > 50) {
      if (dx < 0) onImageChange(nextIndex)
      else onImageChange(prevIndex)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        className={`relative w-full cursor-zoom-in overflow-hidden rounded-lg bg-neutral-900 ${aspect === 'portrait' ? 'aspect-[3/4]' : 'aspect-square'}`}
        onClick={() => setLightbox(true)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {filtered.map((img, i) => (
          <Image
            key={img.url}
            src={img.url}
            alt={img.alt ?? nombre}
            width={800}
            height={800}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
              i === index ? 'opacity-100' : 'opacity-0'
            }`}
            priority={i === 0}
            sizes="(max-width: 768px) 100vw, 60vw"
          />
        ))}

        {filtered.length > 1 && (
          <>
            <button
              onClick={() => onImageChange(prevIndex)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80"
              aria-label="Imagen anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => onImageChange(nextIndex)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80"
              aria-label="Imagen siguiente"
            >
              <ChevronRight size={20} />
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
              {index + 1} / {filtered.length}
            </div>
          </>
        )}
      </div>

      {filtered.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
          {filtered.map((img, i) => (
            <button
              key={img.url}
              onClick={() => onImageChange(i)}
              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md transition-all ${
                i === index
                  ? 'ring-2 ring-red-600 ring-offset-2 ring-offset-neutral-900'
                  : 'opacity-60 hover:opacity-100'
              }`}
              aria-label={`Ver imagen ${i + 1}`}
            >
              <Image
                src={img.url}
                alt={img.alt ?? `${nombre} ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={() => setLightbox(false)}>
          <button onClick={() => setLightbox(false)} className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" aria-label="Cerrar">
            <X size={20} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onImageChange(prevIndex) }}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
            aria-label="Anterior"
          >
            <ChevronLeft size={24} />
          </button>
          <img
            src={filtered[index]?.url}
            alt={filtered[index]?.alt ?? nombre}
            className={`max-h-[85vh] max-w-[90vw] object-contain transition-transform duration-300 ${zoom ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}`}
            onClick={(e) => { e.stopPropagation(); setZoom((z) => !z) }}
          />
          <button
            onClick={(e) => { e.stopPropagation(); onImageChange(nextIndex) }}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
            aria-label="Siguiente"
          >
            <ChevronRight size={24} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
            {index + 1} / {filtered.length}
          </div>
        </div>
      )}
    </div>
  );
}

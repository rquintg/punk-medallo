'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProductImage } from '@/features/tienda/types';

interface ProductGalleryProps {
  imagenes: ProductImage[];
  nombre: string;
  selectedColor?: string | null;
  imageIndex: number;
  onImageChange: (index: number) => void;
}

export function ProductGallery({ imagenes, nombre, selectedColor, imageIndex, onImageChange }: ProductGalleryProps) {
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

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-neutral-900">
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
        <div className="flex gap-3 overflow-x-auto pb-2">
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
    </div>
  );
}

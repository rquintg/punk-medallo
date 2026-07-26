'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProductImage } from '@/features/tienda/types';

interface ProductGalleryProps {
  imagenes: ProductImage[];
  nombre: string;
}

export function ProductGallery({ imagenes, nombre }: ProductGalleryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const imageIndex = Math.min(
    Math.max(Number(searchParams.get('image')) || 0, 0),
    imagenes.length - 1,
  );

  const prevIndex = imageIndex > 0 ? imageIndex - 1 : imagenes.length - 1;
  const nextIndex = imageIndex < imagenes.length - 1 ? imageIndex + 1 : 0;

  function navigateImage(index: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('image', String(index));
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-neutral-900">
        {imagenes.map((img, i) => (
          <Image
            key={img.url}
            src={img.url}
            alt={img.alt ?? nombre}
            width={800}
            height={800}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
              i === imageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            priority={i === 0}
            sizes="(max-width: 768px) 100vw, 60vw"
          />
        ))}

        {imagenes.length > 1 && (
          <>
            <button
              onClick={() => navigateImage(prevIndex)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80"
              aria-label="Imagen anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => navigateImage(nextIndex)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80"
              aria-label="Imagen siguiente"
            >
              <ChevronRight size={20} />
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
              {imageIndex + 1} / {imagenes.length}
            </div>
          </>
        )}
      </div>

      {imagenes.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {imagenes.map((img, i) => (
            <button
              key={img.url}
              onClick={() => navigateImage(i)}
              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md transition-all ${
                i === imageIndex
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

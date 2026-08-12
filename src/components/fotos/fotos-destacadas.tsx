"use client";

import Image from "next/image";
import { Flame } from "lucide-react";
import type { FotoFacebook, VideoFacebook } from "@/features/fotos/types";
import {
  ES_FOTO,
  FOTO_ALT_FALLBACK,
  formatDuracion,
  formatInteraccion,
  interaccion,
  srcMasCercana,
} from "@/features/fotos/types";

interface FotosDestacadasProps {
  items: (FotoFacebook | VideoFacebook)[];
  onSelect: (index: number) => void;
}

function captions(item: FotoFacebook | VideoFacebook): string {
  return ES_FOTO(item)
    ? (item.name ?? FOTO_ALT_FALLBACK)
    : (item.description ?? "Video del registro fotográfico de Punk Medallo");
}

function anioDe(item: FotoFacebook | VideoFacebook): string {
  return item.createdAt.slice(0, 4);
}

export function FotosDestacadas({ items, onSelect }: FotosDestacadasProps) {
  if (items.length === 0) return null;

  return (
    <section className="border-b border-neutral-800">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#dc2626]">
            Archivo
          </p>
          <h2 className="mt-1 text-lg font-bold uppercase tracking-wide text-white sm:text-xl">
            Lo más visto
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Las publicaciones del registro con más interacción en Facebook
          </p>
        </div>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-4 [scrollbar-width:thin] sm:-mx-8 sm:px-8">
        <div className="flex w-max gap-4">
          {items.map((item, index) => {
            const inter = interaccion(item);
            const anio = anioDe(item);
            return (
              <figure
                key={item.id}
                className="group relative w-[240px] shrink-0 overflow-hidden rounded-lg border border-neutral-800 bg-[#111] transition-all duration-300 hover:border-[#dc2626]/60 sm:w-[280px]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-900">
                  {ES_FOTO(item) ? (
                    <Image
                      src={srcMasCercana(item, 600)}
                      alt={captions(item)}
                      width={item.width}
                      height={item.height}
                      sizes="(min-width: 640px) 280px, 240px"
                      className="h-full w-full object-cover transition duration-300 ease-in-out group-hover:scale-[1.02]"
                      unoptimized
                    />
                  ) : (
                    <Image
                      src={item.thumbnail}
                      alt={captions(item)}
                      fill
                      sizes="(min-width: 640px) 280px, 240px"
                      className="object-cover transition duration-300 ease-in-out group-hover:scale-[1.02]"
                      unoptimized
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => onSelect(index)}
                    aria-label={`Ver publicación: ${captions(item)}`}
                    className="absolute inset-0 z-0"
                  />

                  {inter > 0 && (
                    <span className="absolute right-2 top-2 z-10 flex items-center justify-center gap-1 rounded-sm bg-[#dc2626] px-2 py-1 font-mono text-[11px] font-bold tracking-widest text-white shadow-lg shadow-black/40">
                      <Flame size={12} aria-hidden="true" />
                      {formatInteraccion(inter)}
                    </span>
                  )}

                  {anio && (
                    <span className="absolute left-2 top-2 z-10 rounded-sm bg-black/70 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-widest text-neutral-200 backdrop-blur">
                      {anio}
                    </span>
                  )}

                  {!ES_FOTO(item) && item.durationSec !== undefined && (
                    <span className="absolute bottom-2 right-2 z-10 rounded-sm bg-black/80 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-white backdrop-blur">
                      {formatDuracion(item.durationSec) ?? "VIDEO"}
                    </span>
                  )}
                </div>

                <figcaption className="pointer-events-none border-t border-neutral-800/70 px-3 py-2.5">
                  <p className="line-clamp-2 text-xs leading-relaxed text-neutral-400">
                    {captions(item)}
                  </p>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Download } from "lucide-react";
import type { Album } from "@/features/descargas/types";
import { bandSlug, coverAtSize } from "@/features/descargas/utils/album";
import { getResena } from "@/data/resenas";
import { CoverImage } from "./cover-image";
import { FormatBadge } from "./format-badge";

const AUTOPLAY_MS = 6000;

interface DestacadosHeroProps {
  albums: Album[];
}

export function DestacadosHero({ albums }: DestacadosHeroProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = albums.length;

  const goTo = useCallback(
    (index: number) => {
      setActive(((index % count) + count) % count);
    },
    [count]
  );

  const step = useCallback(
    (direction: 1 | -1) => {
      setActive((current) =>
        ((current + direction) % count + count) % count
      );
    },
    [count]
  );

  useEffect(() => {
    if (count < 2 || paused) return;
    timerRef.current = setInterval(() => {
      setActive((current) => (current + 1) % count);
    }, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [count, paused]);

  if (count === 0) return null;

  return (
    <section
      aria-label="Destacados del archivo"
      className="mb-14 border-b border-neutral-800 pb-14"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-[#dc2626]">
            Destacados
          </h2>
          <p className="mt-1 text-sm text-neutral-400">
            Clásicos del archivo punk de Medellín.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={count < 2}
            aria-label="Destacado anterior"
            className="flex h-8 w-8 items-center justify-center rounded border border-neutral-700 bg-[#111] text-neutral-300 transition-colors hover:border-[#dc2626] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={count < 2}
            aria-label="Destacado siguiente"
            className="flex h-8 w-8 items-center justify-center rounded border border-neutral-700 bg-[#111] text-neutral-300 transition-colors hover:border-[#dc2626] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div>
        {albums.map((item, index) => {
          const activeItem = index === active;
          const resena = getResena(item.slug);
          const primaryDownload = item.downloadLinks[0];
          const bandLink =
            item.band !== "Varios Artistas"
              ? `/descargas/banda/${bandSlug(item.band)}`
              : null;
          return (
            <div
              key={item.slug}
              className={`pm-fade-in ${activeItem ? "" : "hidden"}`}
              aria-hidden={!activeItem}
            >
              <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,360px)_1fr]">
                <div className="relative aspect-square overflow-hidden rounded-lg border border-neutral-800 shadow-[0_0_60px_rgba(220,38,38,0.18)]">
                  <CoverImage
                    src={coverAtSize(item.coverUrl, 1200)}
                    alt={`Portada de ${item.title} — ${item.band}`}
                    sizes="(min-width: 1024px) 360px, 100vw"
                    priority={activeItem}
                    className="object-cover"
                  />
                  <span className="absolute left-3 top-3 z-10">
                    <FormatBadge format={item.format} />
                  </span>
                </div>

                <div>
                  {bandLink ? (
                    <Link
                      href={bandLink}
                      className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-[#dc2626] transition-colors hover:text-white"
                    >
                      {item.band}
                    </Link>
                  ) : (
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-[#dc2626]">
                      {item.band}
                    </p>
                  )}
                  <h3 className="mt-3 text-2xl font-bold leading-tight text-white md:text-4xl">
                    {item.title}
                  </h3>

                  <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-neutral-500">
                    {item.year && (
                      <span className="text-sm font-semibold text-white">
                        {item.year}
                      </span>
                    )}
                    {item.trackList.length > 0 && (
                      <span>
                        {item.trackList.length}{" "}
                        {item.trackList.length === 1 ? "canción" : "canciones"}
                      </span>
                    )}
                    {item.commentCount > 0 && (
                      <span>{item.commentCount} comentarios</span>
                    )}
                  </p>

                  {resena && (
                    <p className="mt-6 line-clamp-4 text-sm leading-relaxed text-neutral-300">
                      {resena}
                    </p>
                  )}

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Link
                      href={`/descargas/${item.slug}`}
                      className="flex items-center gap-2 rounded-md bg-[#dc2626] px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#b91c1c]"
                    >
                      Ver álbum
                      <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                    {primaryDownload && (
                      <a
                        href={primaryDownload.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-md border border-neutral-600 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:border-[#dc2626] hover:text-[#dc2626]"
                      >
                        <Download size={15} aria-hidden="true" />
                        Descargar
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {albums.map((item, index) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Ir a destacado ${index + 1}: ${item.title}`}
              aria-current={index === active}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === active
                  ? "w-6 bg-[#dc2626]"
                  : "w-3 bg-neutral-700 hover:bg-neutral-500"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

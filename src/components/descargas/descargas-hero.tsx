"use client";

import { Shuffle, Search } from "lucide-react";

interface DescargasHeroProps {
  totalAlbums: number;
  totalBands: number;
  latestPublished: string | null;
  query: string;
  onQueryChange: (value: string) => void;
  onRandom: () => void;
}

function daysSince(iso: string | null): string {
  if (!iso) return "";
  const days = Math.max(
    0,
    Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  );
  if (days === 0) return "hoy";
  if (days === 1) return "ayer";
  return `hace ${days} días`;
}

export function DescargasHero({
  totalAlbums,
  totalBands,
  latestPublished,
  query,
  onQueryChange,
  onRandom,
}: DescargasHeroProps) {
  const latest = daysSince(latestPublished);

  return (
    <section className="border-b border-neutral-800 bg-[#101010]">
      <div className="mx-auto max-w-6xl px-4 pt-24 pb-12 md:pt-28 md:pb-16">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#dc2626]">
          Punk Medallo — Archivo digital
        </p>
        <h1 className="mt-3 text-5xl font-bold uppercase leading-none tracking-tight text-white md:text-7xl">
          El{" "}
          <span className="text-[#dc2626]">Blog</span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-400 md:text-base">
          {totalAlbums} Trabajos del punk, hardcore y el ruido underground de
          Medellín. Cada disco con su portada, canciones y enlace de
          descarga.
        </p>

        <div className="mt-8 flex max-w-xl items-center gap-3">
          <label className="relative flex-1">
            <span className="sr-only">Buscar banda o álbum</span>
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
              size={16}
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Buscar banda o álbum..."
              className="w-full rounded-md border border-neutral-700 bg-[#181818] py-3 pl-10 pr-4 text-sm text-white placeholder:text-neutral-500 outline-none transition-colors focus:border-[#dc2626]"
            />
          </label>
          <button
            type="button"
            onClick={onRandom}
            className="flex shrink-0 items-center gap-2 rounded-md border border-neutral-700 bg-[#181818] px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral-300 transition-colors hover:border-[#dc2626] hover:text-[#dc2626]"
          >
            <Shuffle size={14} aria-hidden="true" />
            <span className="hidden sm:inline">Aleatorio</span>
          </button>
        </div>

        <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 font-mono text-sm">
          <div>
            <dt className="sr-only">Álbumes</dt>
            <dd className="text-2xl font-bold text-white">{totalAlbums}</dd>
            <dd className="text-[11px] uppercase tracking-widest text-neutral-500">
              lanzamientos
            </dd>
          </div>
          <div>
            <dt className="sr-only">Bandas</dt>
            <dd className="text-2xl font-bold text-white">{totalBands}</dd>
            <dd className="text-[11px] uppercase tracking-widest text-neutral-500">
              bandas
            </dd>
          </div>
          {latest && (
            <div>
              <dt className="sr-only">Última publicacion</dt>
              <dd className="text-2xl font-bold text-white">{latest}</dd>
              <dd className="text-[11px] uppercase tracking-widest text-neutral-500">
                última publicacion
              </dd>
            </div>
          )}
        </dl>
      </div>
    </section>
  );
}

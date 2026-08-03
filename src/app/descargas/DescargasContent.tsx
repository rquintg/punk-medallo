"use client";

import { useCallback } from "react";
import { Loader2, X } from "lucide-react";
import type { Album, BandInfo, OrderBy } from "@/features/descargas/types";
import { useAlbums } from "@/hooks/useAlbums";
import { DescargasHero } from "@/components/descargas/descargas-hero";
import { BandTicker } from "@/components/descargas/band-ticker";
import { BandIndex } from "@/components/descargas/band-index";
import { AlbumGrid } from "@/components/descargas/album-grid";
import { AlbumCard } from "@/components/descargas/album-card";
import { AlbumGridSkeleton } from "@/components/descargas/album-skeleton";
import { EmptyState } from "@/components/descargas/empty-state";
import { FormatFilter } from "@/components/descargas/format-filter";

interface DescargasContentProps {
  initialAlbums: Album[];
  initialNextPageToken: string | null;
  totalItems: number;
  totalBands: number;
  bands: BandInfo[];
  latestPublished: string | null;
  years: string[];
}

export default function DescargasContent({
  initialAlbums,
  initialNextPageToken,
  totalItems,
  totalBands,
  bands,
  latestPublished,
  years,
}: DescargasContentProps) {
  const {
    albums,
    nextPageToken,
    query,
    setQuery,
    orderBy,
    setOrderBy,
    filters,
    setFilters,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
  } = useAlbums({
    initialAlbums,
    initialNextPageToken,
  });

  const hasFilters =
    Boolean(query) || Boolean(filters.letra) || Boolean(filters.banda);
  const showSkeletons = isLoading && albums.length === 0;

  const handleRandom = useCallback(() => {
    if (albums.length === 0) return;
    const random = albums[Math.floor(Math.random() * albums.length)];
    window.location.href = `/descargas/${random.slug}`;
  }, [albums]);

  const clearAllFilters = useCallback(() => {
    setQuery("");
    setFilters({ letra: null, formato: null, banda: null, year: null });
  }, [setQuery, setFilters]);

  return (
    <div className="min-h-screen bg-[#181818]">
      <DescargasHero
        totalAlbums={totalItems}
        totalBands={totalBands}
        latestPublished={latestPublished}
        query={query}
        onQueryChange={setQuery}
        onRandom={handleRandom}
      />

      <BandTicker bands={bands} />

      <BandIndex
        bands={bands}
        activeLetter={filters.letra}
        onLetterChange={(letter) =>
          setFilters((prev) => ({ ...prev, letra: letter }))
        }
        onSelectBand={(band) =>
          setFilters((prev) => ({ ...prev, banda: band }))
        }
      />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <FormatFilter
              active={filters.formato}
              onChange={(formato) =>
                setFilters((prev) => ({ ...prev, formato }))
              }
            />

            {years.length > 0 && (
              <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                Año
                <select
                  value={filters.year ?? ""}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      year: event.target.value || null,
                    }))
                  }
                  className="rounded border border-neutral-700 bg-[#181818] px-2 py-1.5 text-xs text-white outline-none focus:border-[#dc2626]"
                >
                  <option value="">Todos</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
              Orden
              <select
                value={orderBy}
                onChange={(event) =>
                  setOrderBy(event.target.value as OrderBy)
                }
                className="rounded border border-neutral-700 bg-[#181818] px-2 py-1.5 text-xs text-white outline-none focus:border-[#dc2626]"
              >
                <option value="published">Más recientes</option>
                <option value="updated">Actualizados</option>
              </select>
            </label>
          </div>
        </div>

        <div className="mt-5 mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
            {query
              ? `Resultados para "${query}"`
              : filters.banda
                ? `Lanzamientos de ${filters.banda}`
                : filters.letra
                  ? `Lanzamientos — letra ${filters.letra}`
                  : filters.formato
                    ? "Filtrados por formato"
                    : filters.year
                      ? `Lanzamientos de ${filters.year}`
                      : "Últimos lanzamientos"}
          </p>
          <div className="flex items-center gap-3">
            <p className="font-mono text-xs text-neutral-600">
              mostrando {albums.length}
              {!hasFilters && ` de ${totalItems}`}
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-widest text-[#dc2626] transition-colors hover:text-white"
              >
                <X size={12} aria-hidden="true" />
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {showSkeletons ? (
          <AlbumGridSkeleton count={8} />
        ) : albums.length === 0 ? (
          <EmptyState
            title={query ? "SIN RESULTADOS" : "NADA EN EL ARCHIVO"}
            description={
              query
                ? `No se encontró nada para "${query}". Probá con el nombre de la banda o el álbum.`
                : "No hay lanzamientos para mostrar con este filtro."
            }
          />
        ) : (
          <AlbumGrid>
            {albums.map((album, index) => (
              <AlbumCard key={album.slug} album={album} position={index + 1} />
            ))}
          </AlbumGrid>
        )}

        {error && (
          <p className="mt-6 text-center text-sm text-[#dc2626]" role="alert">
            {error}
          </p>
        )}

        {nextPageToken && !hasFilters && albums.length > 0 && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={loadMore}
              disabled={isLoadingMore}
              className="flex items-center gap-2 rounded-md border border-neutral-700 bg-[#181818] px-6 py-3 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:border-[#dc2626] hover:text-[#dc2626] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoadingMore && (
                <Loader2 className="animate-spin" size={15} aria-hidden="true" />
              )}
              Cargar más
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

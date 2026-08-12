"use client";

import { useMemo, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import type {
  FotoFacebook,
  ItemFotos,
  PaginaFotos,
  VideoFacebook,
} from "@/features/fotos/types";
import { ES_FOTO } from "@/features/fotos/types";
import type { StatsArchivo } from "@/lib/axiosFacebook";
import { useFotos, useFotosTop, type TipoFotos } from "@/hooks/useFotos";
import { FotosHero } from "@/components/fotos/fotos-hero";
import { FotoCard } from "@/components/fotos/foto-card";
import { VideoCard } from "@/components/fotos/video-card";
import { FotosLightbox } from "@/components/fotos/fotos-lightbox";
import { FotosDestacadas } from "@/components/fotos/fotos-destacadas";
import { FotosGridSkeleton } from "@/components/fotos/fotos-skeleton";
import { FotosEmptyState } from "@/components/fotos/fotos-empty";

const TABS: { id: TipoFotos; label: string }[] = [
  { id: "fotos", label: "Fotos" },
  { id: "videos", label: "Videos" },
];

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function itemAnio(item: FotoFacebook | VideoFacebook): string {
  return item.createdAt.slice(0, 4);
}

interface FotosContentProps {
  initialFotos?: PaginaFotos;
  initialVideos?: PaginaFotos;
  initialTop?: ItemFotos[];
  initialStats?: StatsArchivo | null;
}

export default function FotosContent({
  initialFotos,
  initialVideos,
  initialTop,
  initialStats,
}: FotosContentProps) {
  const [tipo, setTipo] = useState<TipoFotos>("fotos");
  const [anio, setAnio] = useState("");
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [destacadaIndex, setDestacadaIndex] = useState<number | null>(null);

  const fotos = useFotos({ tipo: "fotos", initialData: initialFotos });
  const videos = useFotos({ tipo: "videos", initialData: initialVideos });
  const top = useFotosTop(initialTop);

  const activo = tipo === "fotos" ? fotos : videos;

  const anios = useMemo(() => {
    const todos = [...fotos.items, ...videos.items];
    const set = new Set<string>();
    for (const item of todos) {
      if (itemAnio(item)) set.add(itemAnio(item));
    }
    return [...set].sort().reverse();
  }, [fotos.items, videos.items]);

  const filtrados = useMemo(() => {
    const q = normalizar(query.trim());
    let lista = activo.items;
    if (anio) lista = lista.filter((it) => itemAnio(it) === anio);
    if (q) {
      lista = lista.filter((it) => {
        const texto = normalizar(
          ES_FOTO(it) ? [it.name ?? "", it.altText ?? ""].join(" ") : it.description ?? ""
        );
        return texto.includes(q);
      });
    }
    return lista;
  }, [activo.items, anio, query]);

  const tieneFiltros = Boolean(query) || Boolean(anio) || tipo !== "fotos";

  // Fallback derivado de lo cargado; la fuente de verdad son las stats exactas
  // del archivo (initialStats) cuando llegan del server.
  const stats = useMemo(() => {
    const fotosN = fotos.items.length;
    const videosN = videos.items.length;
    const ultima = [...fotos.items, ...videos.items]
      .map((i) => i.createdAt)
      .sort()
      .filter(Boolean)
      .at(-1);
    return {
      totalFotos: fotosN,
      totalVideos: videosN,
      aniosCubiertos: anios.length,
      ultimaPublicacion: ultima ?? null,
    };
  }, [fotos.items, videos.items, anios]);

  const statsHero = useMemo(() => {
    const totalArchivos =
      initialStats && initialStats.totalFotos + initialStats.totalVideos > 0
        ? initialStats.totalFotos + initialStats.totalVideos
        : stats.totalFotos + stats.totalVideos;
    if (initialStats) {
      return {
        totalArchivos,
        totalFotos: initialStats.totalFotos,
        totalVideos: initialStats.totalVideos,
        aniosCubiertos:
          initialStats.minYear && initialStats.maxYear
            ? initialStats.maxYear - initialStats.minYear + 1
            : stats.aniosCubiertos,
        rangoAnios:
          initialStats.minYear && initialStats.maxYear
            ? `${initialStats.minYear}–${initialStats.maxYear}`
            : null,
        ultimaPublicacion:
          initialStats.ultimaPublicacion ?? stats.ultimaPublicacion,
      };
    }
    return {
      totalArchivos,
      totalFotos: stats.totalFotos,
      totalVideos: stats.totalVideos,
      aniosCubiertos: stats.aniosCubiertos,
      rangoAnios: null,
      ultimaPublicacion: stats.ultimaPublicacion,
    };
  }, [initialStats, stats]);

  const seleccionable = useMemo(
    () => (tipo === "fotos" ? (fotos.items as (FotoFacebook | VideoFacebook)[]) : videos.items),
    [tipo, fotos.items, videos.items]
  );

  const cambiarTipo = (t: TipoFotos) => {
    if (t === tipo) return;
    setTipo(t);
    setAnio("");
    setQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  function abrir(itemIndex: number) {
    setSelectedIndex(itemIndex);
  }

  function cerrarLightbox() {
    setSelectedIndex(null);
  }

  return (
    <div className="min-h-screen bg-[#181818]">
      <FotosHero
        totalArchivos={statsHero.totalArchivos}
        aniosCubiertos={statsHero.aniosCubiertos}
        rangoAnios={statsHero.rangoAnios}
        ultimaPublicacion={statsHero.ultimaPublicacion}
      />

      <main className="mx-auto max-w-6xl px-4 py-10">
        {top.isLoading ? (
          <div className="mb-10">
            <section className="border-b border-neutral-800">
              <div className="mb-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#dc2626]">
                  Archivo
                </p>
                <h2 className="mt-1 text-lg font-bold uppercase tracking-wide text-white sm:text-xl">
                  Lo más visto
                </h2>
              </div>
              <div className="flex w-max gap-4 pb-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[240px] shrink-0 animate-pulse rounded-lg border border-neutral-800 bg-[#111] sm:w-[280px]"
                  >
                    <div className="aspect-[4/3] bg-neutral-900" />
                    <div className="space-y-2 border-t border-neutral-800/70 p-3">
                      <div className="h-2.5 w-3/4 rounded bg-neutral-800" />
                      <div className="h-2.5 w-1/2 rounded bg-neutral-800" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : top.data && top.data.length > 0 ? (
          <div className="mb-10">
            <FotosDestacadas items={top.data} onSelect={setDestacadaIndex} />
          </div>
        ) : null}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Tipo de material">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={tipo === tab.id}
                onClick={() => cambiarTipo(tab.id)}
                className={`rounded-md border px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest transition-colors ${
                  tipo === tab.id
                    ? "border-[#dc2626] bg-[#dc2626] text-white"
                    : "border-neutral-700 bg-[#181818] text-neutral-400 hover:border-[#dc2626] hover:text-white"
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 ${tipo === tab.id ? "text-white/70" : "text-neutral-600"}`}>
                  {tab.id === "fotos" ? statsHero.totalFotos : statsHero.totalVideos}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {anios.length > 0 && (
              <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                Año
                <select
                  value={anio}
                  onChange={(e) => setAnio(e.target.value)}
                  className="rounded border border-neutral-700 bg-[#181818] px-2 py-1.5 text-xs text-white outline-none focus:border-[#dc2626]"
                >
                  <option value="">Todos</option>
                  {anios.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="relative">
              <span className="sr-only">Buscar en el registro</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                size={14}
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar en el registro…"
                className="w-56 rounded border border-neutral-700 bg-[#181818] py-1.5 pl-9 pr-3 text-xs text-white outline-none placeholder:text-neutral-600 focus:border-[#dc2626]"
              />
            </label>
          </div>
        </div>

        <div className="mt-5 mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
            {tipo === "fotos" ? "Registro fotográfico" : "La movida en video"}
            {query && ` — resultados para "${query}"`}
          </p>
          <div className="flex items-center gap-3">
            <p className="font-mono text-xs text-neutral-600">
              {filtrados.length} {filtrados.length === 1 ? "elemento" : "elementos"}
              {activo.isFetchingMore && (
                <Loader2 className="ml-2 inline animate-spin" size={12} aria-hidden="true" />
              )}
            </p>
            {tieneFiltros && (
              <button
                type="button"
                onClick={() => {
                  setAnio("");
                  setQuery("");
                }}
                className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-widest text-[#dc2626] transition-colors hover:text-white"
              >
                <X size={12} aria-hidden="true" />
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {activo.isLoading ? (
          <FotosGridSkeleton count={12} />
        ) : activo.error ? (
          <FotosEmptyState mensaje={activo.error} onRetry={() => void activo.refetch()} />
        ) : filtrados.length === 0 ? (
          <FotosEmptyState
            mensaje={
              query || anio
                ? "No se encontró nada con estos filtros. Probá con otros términos."
                : tipo === "fotos"
                  ? "Cuando publiquen fotos en Facebook, aparecerán acá."
                  : "Cuando publiquen videos en Facebook, aparecerán acá."
            }
            onRetry={activo.error ? () => void activo.refetch() : undefined}
          />
        ) : (
          <>
            <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
              {filtrados.map((item) => {
                const globalIndex = seleccionable.findIndex((it) => it.id === item.id);
                return ES_FOTO(item) ? (
                  <FotoCard
                    key={item.id}
                    foto={item}
                    onSelect={() => abrir(globalIndex >= 0 ? globalIndex : 0)}
                  />
                ) : (
                  <VideoCard
                    key={item.id}
                    video={item}
                    onSelect={() => abrir(globalIndex >= 0 ? globalIndex : 0)}
                  />
                );
              })}
            </div>

            {activo.hasMore && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={activo.loadMore}
                  disabled={activo.isFetchingMore}
                  className="flex items-center gap-2 rounded-md border border-neutral-700 bg-[#181818] px-6 py-3 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:border-[#dc2626] hover:text-[#dc2626] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {activo.isFetchingMore && (
                    <Loader2 className="animate-spin" size={15} aria-hidden="true" />
                  )}
                  Cargar más
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {selectedIndex !== null && seleccionable.length > 0 && (
        <FotosLightbox
          items={seleccionable}
          index={selectedIndex % seleccionable.length}
          onClose={cerrarLightbox}
          onNavigate={setSelectedIndex}
        />
      )}

      {destacadaIndex !== null && top.data && top.data.length > 0 && (
        <FotosLightbox
          items={top.data}
          index={destacadaIndex % top.data.length}
          onClose={() => setDestacadaIndex(null)}
          onNavigate={setDestacadaIndex}
        />
      )}
    </div>
  );
}
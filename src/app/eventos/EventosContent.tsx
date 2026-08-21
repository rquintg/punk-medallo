"use client";

import { useMemo, useState } from "react";
import { Loader2, MapPin, RotateCw, Search, SearchX } from "lucide-react";
import type { Evento } from "@/features/eventos/types";
import { esProximoEvento } from "@/features/eventos/parse-caption";
import useEventos from "@/hooks/useEventos";
import SpinnerLoader from "@/components/util/SpinnerLoader";
import { EventosHero } from "@/components/eventos/eventos-hero";
import { EventoCard } from "@/components/eventos/evento-card";
import { EventoModal } from "@/components/eventos/evento-modal";

type Filtro = "proximos" | "todos" | "reels" | "pasados" | "feed";

const FILTROS: { id: Filtro; label: string }[] = [
  { id: "proximos", label: "Próximos" },
  { id: "todos", label: "Todos" },
  { id: "reels", label: "Reels" },
  { id: "pasados", label: "Pasados" },
  { id: "feed", label: "Feed" },
];

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function mesClave(fecha: string | null): string {
  if (!fecha) return "Sin fecha";
  const [anio, mes] = fecha.split("-").map(Number);
  const nombre = new Intl.DateTimeFormat("es-CO", { month: "short" }).format(
    new Date(anio, mes - 1, 1)
  );
  return `${nombre.replace(/\./g, "").toUpperCase()} ${anio}`;
}

export default function EventosContent({
  initialEventos,
}: {
  initialEventos?: Evento[];
}) {
  const { eventos, loading, error, refetch, isFetching } = useEventos(initialEventos);
  const [filtro, setFiltro] = useState<Filtro>("proximos");
  const [query, setQuery] = useState("");
  const [lugar, setLugar] = useState("");
  const [selected, setSelected] = useState<Evento | null>(null);
  const [deepLinkResuelto, setDeepLinkResuelto] = useState(false);

  const cambiarFiltro = (f: Filtro) => {
    setFiltro(f);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cambiarLugar = (l: string) => {
    setLugar(l);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deepLinkId = useMemo(() => {
    if (typeof window === "undefined") return null;
    const match = window.location.hash.match(/^#ev-(.+)$/);
    return match ? decodeURIComponent(match[1]) : null;
  }, []);

  if (!deepLinkResuelto && deepLinkId && !selected) {
    const ev = eventos.find((e) => e.id === deepLinkId);
    if (ev) {
      setSelected(ev);
      setDeepLinkResuelto(true);
    }
  }

  const cerrarModal = () => {
    setSelected(null);
    if (window.location.hash.startsWith("#ev-")) {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }
  };

  const lugares = useMemo(() => {
    const set = new Set<string>();
    for (const e of eventos) {
      if (e.lugar && esProximoEvento(e)) set.add(e.lugar);
    }
    return [...set].sort((a, b) => a.localeCompare(b, "es"));
  }, [eventos]);

  const eventosList = useMemo(
    () => eventos.filter((e) => e.tipo === "evento"),
    [eventos]
  );

  const conteos = useMemo(
    () => ({
      proximos: eventosList.filter((e) => esProximoEvento(e)).length,
      todos: eventosList.length,
      reels: eventos.filter((e) => e.mediaType === "VIDEO").length,
      pasados: eventosList.filter((e) => !esProximoEvento(e)).length,
      feed: eventos.filter((e) => e.tipo === "feed").length,
    }),
    [eventos, eventosList]
  );

  const filtrados = useMemo(() => {
    const q = normalizar(query.trim());

    let lista = eventos;
    if (filtro === "proximos") lista = eventosList.filter((e) => esProximoEvento(e));
    if (filtro === "todos") lista = eventosList;
    if (filtro === "pasados") lista = eventosList.filter((e) => !esProximoEvento(e));
    if (filtro === "reels") lista = eventos.filter((e) => e.mediaType === "VIDEO");
    if (filtro === "feed") lista = eventos.filter((e) => e.tipo === "feed");

    if (lugar) lista = lista.filter((e) => e.lugar === lugar);

    if (q) {
      lista = lista.filter((e) => {
        const texto = normalizar([e.titulo, e.lugar ?? ""].join(" "));
        return texto.includes(q);
      });
    }

    return [...lista].sort((a, b) => {
      const fa = a.fecha ?? "";
      const fb = b.fecha ?? "";
      if (fa === fb) return 0;
      return filtro === "proximos" ? fa.localeCompare(fb) : fb.localeCompare(fa);
    });
  }, [eventos, eventosList, filtro, query, lugar]);

  const proximos = useMemo(
    () =>
      eventosList
        .filter((e) => esProximoEvento(e))
        .sort((a, b) => (a.fecha ?? "").localeCompare(b.fecha ?? ""))
        .slice(0, 6),
    [eventosList]
  );

  const tieneFiltros = Boolean(query) || Boolean(lugar) || filtro !== "proximos";

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <SpinnerLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <p className="font-mono text-sm uppercase tracking-[0.2em] text-[#dc2626]">
          Error cargando los toques
        </p>
        <p className="max-w-md text-sm text-neutral-500">{error}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="flex items-center gap-2 rounded-md border border-neutral-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:border-[#dc2626] hover:text-[#dc2626]"
        >
          <RotateCw size={14} aria-hidden="true" />
          Reintentar
        </button>
      </div>
    );
  }

  if (eventos.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 border border-dashed border-neutral-800 text-center">
        <SearchX className="h-10 w-10 text-neutral-600" aria-hidden="true" />
        <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">
          SIN TOQUES POR AHORA
        </p>
        <p className="max-w-md text-sm text-neutral-500">
          Cuando publiquen un flyer en Instagram, aparecerá acá.
        </p>
      </div>
    );
  }

  const mostrarGrupos = filtrados.length > 0 && !tieneFiltros;
  const grupos: { mes: string; eventos: Evento[] }[] = [];
  if (mostrarGrupos) {
    let actual = "";
    for (const e of filtrados) {
      const mes = mesClave(e.fecha);
      if (mes !== actual) {
        grupos.push({ mes, eventos: [] });
        actual = mes;
      }
      grupos[grupos.length - 1].eventos.push(e);
    }
  }

  return (
    <div className="min-h-screen bg-[#181818]">
      <EventosHero eventos={proximos} />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {FILTROS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => cambiarFiltro(f.id)}
                aria-pressed={filtro === f.id}
                className={`rounded-md border px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest transition-colors ${
                  filtro === f.id
                    ? "border-[#dc2626] bg-[#dc2626] text-white"
                    : "border-neutral-700 bg-[#181818] text-neutral-400 hover:border-[#dc2626] hover:text-white"
                }`}
              >
                {f.label}
                <span
                  className={`ml-1.5 ${
                    filtro === f.id ? "text-white/70" : "text-neutral-600"
                  }`}
                >
                  {conteos[f.id]}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {lugares.length > 0 && (
              <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                <MapPin size={13} aria-hidden="true" />
                <select
                  value={lugar}
                  onChange={(e) => cambiarLugar(e.target.value)}
                  className="rounded border border-neutral-700 bg-[#181818] px-2 py-1.5 text-xs text-white outline-none focus:border-[#dc2626]"
                >
                  <option value="">Todos los lugares</option>
                  {lugares.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="relative">
              <span className="sr-only">Buscar toque</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                size={14}
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar banda o lugar…"
                className="w-56 rounded border border-neutral-700 bg-[#181818] py-1.5 pl-9 pr-3 text-xs text-white outline-none placeholder:text-neutral-600 focus:border-[#dc2626]"
              />
            </label>
          </div>
        </div>

        <div className="mt-5 mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
            {filtro === "proximos"
              ? "Próximos toques"
              : filtro === "pasados"
                ? "Toques pasados"
                : filtro === "reels"
                  ? "Reels de la movida"
                  : filtro === "feed"
                    ? "Publicaciones de la movida"
                    : "Todos los toques"}
            {query && ` — resultados para "${query}"`}
          </p>
          <p className="font-mono text-xs text-neutral-600">
            {filtrados.length} {filtrados.length === 1 ? "toque" : "toques"}
            {isFetching && (
              <Loader2 className="ml-2 inline animate-spin" size={12} aria-hidden="true" />
            )}
          </p>
        </div>

        {filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 border border-dashed border-neutral-800 py-20 text-center">
            <SearchX className="h-10 w-10 text-neutral-600" aria-hidden="true" />
            <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">
              SIN RESULTADOS
            </p>
            <p className="max-w-md text-sm text-neutral-500">
              No se encontraron toques con estos filtros. Prueba con otros términos.
            </p>
          </div>
        ) : mostrarGrupos ? (
          grupos.map((grupo) => (
            <section key={grupo.mes} className="mb-10">
              <h2 className="mb-4 border-b border-neutral-800 pb-2 font-mono text-xs font-semibold uppercase tracking-[0.25em] text-[#dc2626]">
                {grupo.mes}
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {grupo.eventos.map((evento) => (
                  <EventoCard
                    key={evento.id}
                    evento={evento}
                    onSelect={setSelected}
                  />
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtrados.map((evento) => (
              <EventoCard key={evento.id} evento={evento} onSelect={setSelected} />
            ))}
          </div>
        )}
      </main>

      {selected && (
        <EventoModal evento={selected} onClose={cerrarModal} />
      )}
    </div>
  );
}

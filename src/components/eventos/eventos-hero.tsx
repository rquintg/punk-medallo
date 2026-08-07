"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CalendarPlus, Check, ChevronLeft, ChevronRight, ExternalLink, MessageCircle, Share2 } from "lucide-react";
import type { Evento } from "@/features/eventos/types";
import {
  diasHasta,
  etiquetaProximidad,
  formatearFecha,
  formatearHora,
  formatearPrecio,
} from "@/features/eventos/format";
import { googleCalendarUrl } from "@/features/eventos/add-to-calendar";
import { compartirEvento, whatsappUrl } from "@/features/eventos/share";

const AUTOPLAY_MS = 6000;

interface EventosHeroProps {
  eventos: Evento[];
}

export function EventosHero({ eventos }: EventosHeroProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = eventos.length;

  const handleCompartir = async (evento: Evento) => {
    const resultado = await compartirEvento(evento);
    if (resultado === "copied") {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const goTo = useCallback(
    (index: number) => {
      setActive(((index % count) + count) % count);
    },
    [count]
  );

  const step = useCallback(
    (direction: 1 | -1) => {
      setActive((current) => ((current + direction) % count + count) % count);
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
      aria-label="Próximos toques"
      className="border-b border-neutral-800 bg-[#101010]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="mx-auto max-w-6xl px-4 pt-24 pb-12 md:pt-28 md:pb-16">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-[#dc2626]">
              Agenda de la movida
            </p>
            <h1 className="mt-1 text-3xl font-bold uppercase tracking-tight text-white md:text-4xl">
              Próximos Toques
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-400">
              La agenda punk de Medellín: fechas, lugares, horarios y precios de
              los próximos conciertos y toques, directo de los flyers que
              publicamos en Instagram. La movida no para — acá está todo lo que
              se viene.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => step(-1)}
              disabled={count < 2}
              aria-label="Toque anterior"
              className="flex h-8 w-8 items-center justify-center rounded border border-neutral-700 bg-[#181818] text-neutral-300 transition-colors hover:border-[#dc2626] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              disabled={count < 2}
              aria-label="Toque siguiente"
              className="flex h-8 w-8 items-center justify-center rounded border border-neutral-700 bg-[#181818] text-neutral-300 transition-colors hover:border-[#dc2626] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div>
          {eventos.map((evento, index) => {
            const activeItem = index === active;
            const etiqueta = evento.fecha ? etiquetaProximidad(evento.fecha) : null;
            const precio = formatearPrecio(evento);
            const calendarioUrl = googleCalendarUrl(evento);

            return (
              <div
                key={evento.id}
                className={`pm-fade-in ${activeItem ? "" : "hidden"}`}
                aria-hidden={!activeItem}
              >
                <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,360px)_1fr]">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-neutral-800 shadow-[0_0_60px_rgba(220,38,38,0.18)]">
                    <Image
                      src={evento.flyer}
                      alt={`Flyer del toque ${evento.titulo} en Medellín`}
                      fill
                      sizes="(min-width: 1024px) 360px, 100vw"
                      className="object-cover"
                      priority={activeItem}
                      unoptimized
                    />
                    {etiqueta && (
                      <span
                        className={`absolute left-3 top-3 z-10 rounded-sm px-2 py-1 font-mono text-[10px] font-bold tracking-widest text-white ${
                          etiqueta === "HOY"
                            ? "bg-[#dc2626] shadow-[0_0_16px_rgba(220,38,38,0.9)]"
                            : "bg-[#dc2626]"
                        }`}
                      >
                        {etiqueta}
                      </span>
                    )}
                    {precio && (
                      <span className="absolute right-3 top-3 z-10 rounded-sm bg-black/70 px-2 py-1 font-mono text-[11px] font-bold tracking-wider text-white backdrop-blur">
                        {precio}
                      </span>
                    )}
                  </div>

                  <div>
                    {evento.fecha && (
                      <p className="font-mono text-sm font-semibold uppercase tracking-[0.25em] text-[#dc2626]">
                        {formatearFecha(evento.fecha)}
                      </p>
                    )}
                    <h3 className="mt-3 text-2xl font-bold leading-tight text-white md:text-4xl">
                      {evento.titulo}
                    </h3>

                    <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-neutral-500">
                      {evento.lugar && (
                        <span className="text-sm font-semibold text-white">
                          {evento.lugar}
                        </span>
                      )}
                      {evento.horaInicio && (
                        <span>
                          {formatearHora(evento.horaInicio)}
                          {evento.horaFin && (
                            <> a {formatearHora(evento.horaFin)}</>
                          )}
                        </span>
                      )}
                      {evento.fecha && (
                        <span>
                          {diasHasta(evento.fecha) === 0
                            ? "hoy mismo"
                            : diasHasta(evento.fecha) === 1
                              ? "mañana"
                              : `en ${diasHasta(evento.fecha)} días`}
                        </span>
                      )}
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-4">
                      {calendarioUrl && (
                        <a
                          href={calendarioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-md bg-[#dc2626] px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#b91c1c]"
                        >
                          <CalendarPlus size={15} aria-hidden="true" />
                          Agregar al calendario
                        </a>
                      )}
                      {evento.permalink && (
                        <a
                          href={evento.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-md border border-neutral-600 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:border-[#dc2626] hover:text-[#dc2626]"
                        >
                          <ExternalLink size={15} aria-hidden="true" />
                          Ver en Instagram
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleCompartir(evento)}
                        className="flex items-center gap-2 rounded-md border border-neutral-600 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:border-[#dc2626] hover:text-[#dc2626] md:hidden"
                      >
                        {copiado ? (
                          <Check size={15} aria-hidden="true" />
                        ) : (
                          <Share2 size={15} aria-hidden="true" />
                        )}
                        {copiado ? "¡Copiado!" : "Compartir"}
                      </button>
                      <a
                        href={whatsappUrl(evento)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden items-center gap-2 rounded-md border border-neutral-600 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:border-[#dc2626] hover:text-[#dc2626] md:flex"
                      >
                        <MessageCircle size={15} aria-hidden="true" />
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {count > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {eventos.map((evento, index) => (
              <button
                key={evento.id}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Ir a toque ${index + 1}: ${evento.titulo}`}
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
      </div>
    </section>
  );
}

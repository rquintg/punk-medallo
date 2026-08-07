"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CalendarPlus, Check, Download, ExternalLink, MessageCircle, Share2, X } from "lucide-react";
import type { Evento } from "@/features/eventos/types";
import {
  formatearFecha,
  formatearHora,
  formatearPrecio,
} from "@/features/eventos/format";
import {
  descargarIcs,
  googleCalendarUrl,
} from "@/features/eventos/add-to-calendar";
import { compartirEvento, whatsappUrl } from "@/features/eventos/share";

interface EventoModalProps {
  evento: Evento;
  onClose: () => void;
}

export function EventoModal({ evento, onClose }: EventoModalProps) {
  const calendarioUrl = googleCalendarUrl(evento);
  const precio = formatearPrecio(evento);
  const [copiado, setCopiado] = useState(false);

  const handleCompartir = async () => {
    const resultado = await compartirEvento(evento);
    if (resultado === "copied") {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", handler);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle de ${evento.titulo}`}
      className="fixed inset-0 z-[1200] flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-neutral-800 bg-[#141414] p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar detalle"
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded border border-neutral-700 bg-[#181818] text-neutral-300 transition-colors hover:border-[#dc2626] hover:text-white"
        >
          <X size={16} aria-hidden="true" />
        </button>

        <div className="grid gap-6 md:grid-cols-[minmax(0,240px)_1fr]">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-[240px] overflow-hidden rounded-lg border border-neutral-800">
            <Image
              src={evento.flyer}
              alt={`Flyer del toque ${evento.titulo} en Medellín`}
              fill
              sizes="240px"
              className="object-cover"
              unoptimized
            />
          </div>

          <div>
            {evento.fecha && (
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-[#dc2626]">
                {formatearFecha(evento.fecha)}
              </p>
            )}
            <h3 className="mt-2 text-2xl font-bold leading-tight text-white">
              {evento.titulo}
            </h3>

            <dl className="mt-5 space-y-3 font-mono text-sm">
              {evento.lugar && (
                <div className="flex items-start gap-3">
                  <dt className="w-16 shrink-0 uppercase tracking-widest text-neutral-500">
                    Lugar
                  </dt>
                  <dd className="font-semibold text-white">{evento.lugar}</dd>
                </div>
              )}
              {evento.horaInicio && (
                <div className="flex items-start gap-3">
                  <dt className="w-16 shrink-0 uppercase tracking-widest text-neutral-500">
                    Hora
                  </dt>
                  <dd className="font-semibold text-white">
                    {formatearHora(evento.horaInicio)}
                    {evento.horaFin && (
                      <> a {formatearHora(evento.horaFin)}</>
                    )}
                  </dd>
                </div>
              )}
              {precio && (
                <div className="flex items-start gap-3">
                  <dt className="w-16 shrink-0 uppercase tracking-widest text-neutral-500">
                    Precio
                  </dt>
                  <dd className="font-semibold text-[#dc2626]">{precio}</dd>
                </div>
              )}
            </dl>

            <div className="mt-7 flex flex-wrap items-center gap-2">
              {calendarioUrl && (
                <a
                  href={calendarioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Agregar al calendario de Google"
                  className="flex items-center gap-1.5 rounded-md bg-[#dc2626] px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#b91c1c]"
                >
                  <CalendarPlus size={13} aria-hidden="true" />
                  Calendario
                </a>
              )}
              {evento.fecha && (
                <button
                  type="button"
                  onClick={() => descargarIcs(evento)}
                  className="flex items-center gap-1.5 rounded-md border border-neutral-600 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:border-[#dc2626] hover:text-[#dc2626]"
                >
                  <Download size={13} aria-hidden="true" />
                  .ics
                </button>
              )}
              {evento.permalink && (
                <a
                  href={evento.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-md border border-neutral-600 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:border-[#dc2626] hover:text-[#dc2626]"
                >
                  <ExternalLink size={13} aria-hidden="true" />
                  Instagram
                </a>
              )}
              <button
                type="button"
                onClick={handleCompartir}
                className="flex items-center gap-1.5 rounded-md border border-neutral-600 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:border-[#dc2626] hover:text-[#dc2626] md:hidden"
              >
                {copiado ? (
                  <Check size={13} aria-hidden="true" />
                ) : (
                  <Share2 size={13} aria-hidden="true" />
                )}
                {copiado ? "¡Copiado!" : "Compartir"}
              </button>
              <a
                href={whatsappUrl(evento)}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-1.5 rounded-md border border-neutral-600 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:border-[#dc2626] hover:text-[#dc2626] md:flex"
              >
                <MessageCircle size={13} aria-hidden="true" />
                WhatsApp
              </a>
            </div>

            {evento.caption && (
              <p className="mt-6 line-clamp-4 text-xs leading-relaxed text-neutral-400">
                {evento.caption}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

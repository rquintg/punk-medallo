import Image from "next/image";
import type { Evento } from "@/features/eventos/types";
import {
  etiquetaProximidad,
  formatearFecha,
  formatearHora,
  formatearPrecio,
} from "@/features/eventos/format";

interface EventoCardProps {
  evento: Evento;
  onSelect: (evento: Evento) => void;
}

export function EventoCard({ evento, onSelect }: EventoCardProps) {
  const etiqueta = evento.fecha ? etiquetaProximidad(evento.fecha) : null;
  const precio = formatearPrecio(evento);

  return (
    <article className="group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border border-neutral-800 bg-[#111] transition-all duration-300 hover:border-[#dc2626]/60">
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={evento.flyer}
          alt={`Flyer del toque ${evento.titulo} en Medellín`}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-300 ease-in-out group-hover:scale-105"
          unoptimized
        />

        <button
          type="button"
          onClick={() => onSelect(evento)}
          aria-label={`Ver detalle de ${evento.titulo}`}
          className="absolute inset-0 z-0"
        />

        {etiqueta && (
          <span className="absolute left-2 top-2 z-10 rounded-sm bg-[#dc2626] px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-widest text-white">
            {etiqueta}
          </span>
        )}

        {precio && (
          <span className="absolute right-2 top-2 z-10 rounded-sm bg-black/60 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-neutral-200 backdrop-blur">
            {precio}
          </span>
        )}

        {evento.mediaType === "VIDEO" && (
          <span className="absolute bottom-2 left-2 z-10 rounded-sm bg-black/60 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-neutral-300 backdrop-blur">
            Reel
          </span>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] bg-gradient-to-t from-black/90 via-black/40 to-transparent px-3.5 pb-3 pt-12">
          {evento.fecha && (
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#dc2626]">
              {formatearFecha(evento.fecha)}
            </p>
          )}
          <h3 className="mt-1 line-clamp-2 font-bold leading-snug text-white">
            {evento.titulo}
          </h3>
          {(evento.lugar || evento.horaInicio) && (
            <p className="mt-1 font-mono text-[11px] text-neutral-400">
              {evento.lugar}
              {evento.lugar && evento.horaInicio && (
                <span aria-hidden="true"> · </span>
              )}
              {evento.horaInicio && formatearHora(evento.horaInicio)}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

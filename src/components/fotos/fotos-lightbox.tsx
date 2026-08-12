"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  X,
} from "lucide-react";
import type {
  ComentarioFacebook,
  FotoFacebook,
  VideoFacebook,
} from "@/features/fotos/types";
import {
  ES_FOTO,
  FOTO_ALT_FALLBACK,
  srcAlta,
} from "@/features/fotos/types";
import { useComentarios } from "@/hooks/useFotos";

interface FotosLightboxProps {
  items: (FotoFacebook | VideoFacebook)[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

function formatFecha(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatHoraRelativa(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const dias = Math.floor(hrs / 24);
  if (dias < 7) return `hace ${dias} d`;
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
}

function altDe(item: FotoFacebook | VideoFacebook): string {
  if (ES_FOTO(item)) {
    const alt = item.altText;
    if (alt && !alt.startsWith("No hay ninguna")) return alt;
    if (item.name) return item.name;
    return FOTO_ALT_FALLBACK;
  }
  return item.description || "Video del registro fotográfico de Punk Medallo";
}

function descripcionDe(item: FotoFacebook | VideoFacebook): string | null {
  if (ES_FOTO(item)) return item.name?.trim() || null;
  const d = item.description?.trim();
  return d || null;
}

export function FotosLightbox({ items, index, onClose, onNavigate }: FotosLightboxProps) {
  const item = items[index];
  const total = items.length;

  const comentarios = useComentarios(item?.id ?? null);

  const prev = useCallback(() => {
    onNavigate((index - 1 + total) % total);
  }, [index, total, onNavigate]);

  const next = useCallback(() => {
    onNavigate((index + 1) % total);
  }, [index, total, onNavigate]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handler);
    };
  }, [onClose, prev, next]);

  if (!item) return null;

  const fecha = formatFecha(item.createdAt);
  const link = item.link;
  const descripcion = descripcionDe(item);

  const totalComentarios = comentarios.data?.total ?? 0;
  const mostrarComentarios = totalComentarios > 0;
  const cargandoComentarios = comentarios.isLoading || comentarios.isFetching;
  const comentariosLista = comentarios.data?.items ?? [];

  const panelComentarios = mostrarComentarios && (
    <div className="border-t border-neutral-800 bg-neutral-900/50 p-4 lg:border-t-0">
      <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-[#dc2626]">
        <MessageCircle size={13} aria-hidden="true" />
        {totalComentarios} {totalComentarios === 1 ? "comentario" : "comentarios"}
      </p>

      {cargandoComentarios ? (
        <div className="mt-3 space-y-3" aria-label="Cargando comentarios">
          <div className="h-8 animate-pulse rounded bg-neutral-800" />
          <div className="h-8 animate-pulse rounded bg-neutral-800" />
          <div className="h-8 animate-pulse rounded bg-neutral-800" />
        </div>
      ) : comentariosLista.length > 0 ? (
        <ul className="mt-3 space-y-4">
          {comentariosLista.map((c: ComentarioFacebook) => (
            <li key={c.id || `${item.id}-${c.createdAt}`}>
              <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-200">
                {c.autor}
                <span className="ml-2 font-sans font-normal normal-case tracking-normal text-neutral-500">
                  {formatHoraRelativa(c.createdAt)}
                </span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-neutral-400">
                {c.message}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-neutral-500">
          Los comentarios se ven mejor en la publicación original.
        </p>
      )}

      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block font-mono text-[11px] uppercase tracking-widest text-neutral-400 transition-colors hover:text-[#dc2626]"
      >
        Ver todos en Facebook →
      </a>
    </div>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle de ${altDe(item)}`}
      className="fixed inset-0 z-[1200] flex flex-col bg-black/95 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
        <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
          {index + 1} / {total}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="flex h-9 w-9 items-center justify-center rounded border border-neutral-700 bg-[#111] text-neutral-300 transition-colors hover:border-[#dc2626] hover:text-white"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 items-stretch justify-center gap-3 overflow-y-auto px-4 py-4 md:gap-6 lg:overflow-hidden lg:px-10">
        <button
          type="button"
          onClick={prev}
          aria-label="Anterior"
          className="hidden h-10 w-10 shrink-0 items-center justify-center self-center rounded border border-neutral-700 bg-[#111] text-neutral-300 transition-colors hover:border-[#dc2626] hover:text-white sm:flex"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>

        <div className="flex min-w-0 flex-1 flex-col lg:h-full lg:flex-row lg:items-stretch lg:justify-center lg:gap-8">
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 lg:max-w-none">
            <div className="relative max-h-[70vh] w-auto max-w-full overflow-hidden">
              {ES_FOTO(item) ? (
                <Image
                  src={srcAlta(item)}
                  alt={altDe(item)}
                  width={item.width}
                  height={item.height}
                  className="max-h-[70vh] w-auto max-w-full object-contain"
                  unoptimized
                />
              ) : (
                <div className="flex aspect-video max-w-full items-center justify-center">
                  <Image
                    src={item.thumbnail}
                    alt={altDe(item)}
                    width={1280}
                    height={720}
                    className="max-h-[70vh] w-auto max-w-full object-contain"
                    unoptimized
                  />
                </div>
              )}
            </div>

            {!mostrarComentarios && link && (
              <div className="w-full max-w-2xl text-center">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#dc2626]">
                  {fecha || (ES_FOTO(item) ? "Registro fotográfico" : "Video")}
                </p>
                {descripcion && (
                  <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-neutral-300">
                    {descripcion}
                  </p>
                )}
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-md border border-neutral-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:border-[#dc2626] hover:text-[#dc2626]"
                >
                  <ExternalLink size={14} aria-hidden="true" />
                  Ver en Facebook
                </a>
              </div>
            )}
          </div>

          {mostrarComentarios && (
            <aside className="w-full max-w-2xl shrink-0 lg:w-[340px]">
              <div className="flex max-h-[30vh] flex-col overflow-y-auto lg:max-h-[calc(100vh-8rem)] lg:border-l lg:border-neutral-800 lg:pl-6">
                <div className="px-4 pt-4 text-center lg:px-0 lg:text-left">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#dc2626]">
                    {fecha || (ES_FOTO(item) ? "Registro fotográfico" : "Video")}
                  </p>
                  {descripcion && (
                    <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-neutral-300">
                      {descripcion}
                    </p>
                  )}
                </div>
                {panelComentarios}
                {link && (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-md border border-neutral-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:border-[#dc2626] hover:text-[#dc2626]"
                  >
                    <ExternalLink size={14} aria-hidden="true" />
                    Ver en Facebook
                  </a>
                )}
              </div>
            </aside>
          )}
        </div>

        <button
          type="button"
          onClick={next}
          aria-label="Siguiente"
          className="hidden h-10 w-10 shrink-0 items-center justify-center self-center rounded border border-neutral-700 bg-[#111] text-neutral-300 transition-colors hover:border-[#dc2626] hover:text-white sm:flex"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
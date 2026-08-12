export interface FotoFacebook {
  id: string;
  srcs: { source: string; width: number; height: number }[];
  name?: string;
  altText?: string;
  createdAt: string;
  link: string;
  width: number;
  height: number;
  likeCount?: number;
  commentCount?: number;
}

export interface VideoFacebook {
  id: string;
  thumbnail: string;
  description?: string;
  createdAt: string;
  link: string;
  durationSec?: number;
  likeCount?: number;
  commentCount?: number;
}

export interface PaginaFotos {
  items: (FotoFacebook | VideoFacebook)[];
  next: string | null;
}

export type ItemFotos = FotoFacebook | VideoFacebook;

export interface ComentarioFacebook {
  id: string;
  message?: string;
  createdAt: string;
  autor: string;
}

export interface PaginaComentarios {
  total: number;
  items: ComentarioFacebook[];
}

export const ES_FOTO = (item: FotoFacebook | VideoFacebook): item is FotoFacebook =>
  "srcs" in item;

export function interaccion(
  item: FotoFacebook | VideoFacebook
): number {
  return (item.likeCount ?? 0) + (item.commentCount ?? 0);
}

export function formatInteraccion(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".", ",")}k`;
  return String(n);
}

export const FOTO_ALT_FALLBACK =
  "Foto del registro fotográfico de Punk Medallo";

export function srcMasCercana(foto: FotoFacebook, px: number): string {
  if (foto.srcs.length === 0) return "";
  let best = foto.srcs[0];
  for (const s of foto.srcs) {
    if (Math.abs(s.width - px) < Math.abs(best.width - px)) best = s;
  }
  return best.source;
}

export function srcAlta(foto: FotoFacebook): string {
  return foto.srcs[foto.srcs.length - 1]?.source ?? "";
}

export function formatDuracion(sec?: number): string | null {
  if (!sec || !isFinite(sec) || sec <= 0) return null;
  const total = Math.round(sec);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
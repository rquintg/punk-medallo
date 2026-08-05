import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Album } from "@/features/descargas/types";
import { coverAtSize } from "@/features/descargas/utils/album";
import { CoverImage } from "./cover-image";
import { DownloadActions } from "./download-actions";
import { TrackList } from "./track-list";
import { FormatBadge } from "./format-badge";
import { RelatedCarousel } from "./related-carousel";

interface AlbumDetailProps {
  album: Album;
  related: Album[];
}

function formatDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function AlbumDetail({ album, related }: AlbumDetailProps) {
  const publishedDate = formatDate(album.published);
  const relatedTitle =
    album.band === "Varios Artistas"
      ? "Más de estas bandas"
      : `Más de ${album.band}`;

  return (
    <main className="mx-auto max-w-6xl px-4 pt-24 pb-10">
      <nav aria-label="Migajas de pan" className="mb-8">
        <Link
          href="/descargas"
          className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-neutral-500 transition-colors hover:text-[#dc2626]"
        >
          <ArrowLeft size={13} aria-hidden="true" />
          El Archivo
        </Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr]">
        <aside className="flex flex-col gap-6">
          <div className="relative aspect-square overflow-hidden rounded-lg border border-neutral-800 shadow-[0_0_40px_rgba(220,38,38,0.15)]">
            <CoverImage
              src={coverAtSize(album.coverUrl, 1200)}
              alt={`Portada de ${album.title} — ${album.band}`}
              sizes="(min-width: 1024px) 420px, 100vw"
              className="object-cover"
            />
          </div>
          <DownloadActions album={album} />
        </aside>

        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-[#dc2626]">
            {album.band}
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-white md:text-5xl">
            {album.title}
          </h1>

          <dl className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-neutral-500">
            {album.year && (
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Año</dt>
                <dd className="text-sm font-semibold text-white">
                  {album.year}
                </dd>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Formato</dt>
              <dd>
                <FormatBadge format={album.format} />
              </dd>
            </div>
            {album.trackList.length > 0 && (
              <div>
                <dt className="sr-only">Canciones</dt>
                <dd>
                  {album.trackList.length}{" "}
                  {album.trackList.length === 1 ? "canción" : "canciones"}
                </dd>
              </div>
            )}
            {album.commentCount > 0 && (
              <div>
                <dt className="sr-only">Comentarios</dt>
                <dd>{album.commentCount} comentarios</dd>
              </div>
            )}
          </dl>

          {publishedDate && (
            <p className="mt-2 font-mono text-[11px] text-neutral-600">
              Publicado el {publishedDate}
            </p>
          )}

          <div className="mt-8">
            <TrackList tracks={album.trackList} />
          </div>

          <p className="mt-6 border-b border-neutral-800 pt-4 text-[11px] leading-relaxed text-neutral-400">
            Material de la escena punk distribuido libremente por sus autores.
            Si eres dueño del contenido y deseas retirarlo, contáctanos en{" "}
            <Link
              href="/contacto"
              className="font-mono uppercase tracking-widest text-neutral-500 transition-colors hover:text-[#dc2626]"
            >
              contacto
            </Link>
            .
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <RelatedCarousel title={relatedTitle} albums={related} />
      )}
    </main>
  );
}

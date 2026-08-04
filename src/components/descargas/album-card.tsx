import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import type { Album } from "@/features/descargas/types";
import { coverAtSize } from "@/features/descargas/utils/album";
import { FormatBadge } from "./format-badge";
import { CoverImage } from "./cover-image";

interface AlbumCardProps {
  album: Album;
  position?: number;
}

export function AlbumCard({ album, position }: AlbumCardProps) {
  const primaryDownload = album.downloadLinks[0];
  const detailHref = `/descargas/${album.slug}`;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-neutral-800 bg-[#111] transition-all duration-300 hover:border-[#dc2626]/60">
      <div className="relative block aspect-square overflow-hidden">
        <CoverImage
          src={coverAtSize(album.coverUrl, 1200)}
          alt={`Portada de ${album.title} — ${album.band}`}
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-300 ease-in-out group-hover:scale-105"
        />

        <Link
          href={detailHref}
          aria-label={`Ver álbum ${album.title} — ${album.band}`}
          className="absolute inset-0 z-0"
        />

        <span className="absolute left-2 top-2 z-10">
          <FormatBadge format={album.format} />
        </span>

        {album.isRecent && (
          <span className="absolute right-2 top-2 z-10 rounded-sm bg-[#dc2626] px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-widest text-white">
            NUEVO
          </span>
        )}

        {!album.isRecent && position !== undefined && (
          <span className="absolute right-2 top-2 z-10 rounded-sm bg-black/60 px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-neutral-400 backdrop-blur">
            #{String(position).padStart(3, "0")}
          </span>
        )}

        <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center gap-2 bg-black/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {primaryDownload && (
            <a
              href={primaryDownload.url}
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto flex items-center gap-1.5 rounded-md border border-[#dc2626] bg-[#dc2626] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#b91c1c]"
            >
              <Download size={13} aria-hidden="true" />
              Descargar
            </a>
          )}
          <Link
            href={detailHref}
            className="pointer-events-auto flex items-center gap-1.5 rounded-md border border-neutral-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white transition-colors group-hover:border-neutral-400"
          >
            Ver álbum
            <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#dc2626]">
          {album.band}
        </p>
        <Link href={detailHref}>
          <h3 className="line-clamp-2 font-bold leading-snug text-white transition-colors hover:text-[#dc2626]">
            {album.title}
          </h3>
        </Link>
        <p className="mt-auto flex items-center gap-2 pt-1.5 font-mono text-[11px] text-neutral-500">
          <span>{album.year ?? "s/f"}</span>
          {album.trackList.length > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                {album.trackList.length}{" "}
                {album.trackList.length === 1 ? "track" : "tracks"}
              </span>
            </>
          )}
          {album.commentCount > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span>{album.commentCount} comentarios</span>
            </>
          )}
        </p>
      </div>
    </article>
  );
}

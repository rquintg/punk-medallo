import Image from "next/image";
import { Play } from "lucide-react";
import type { VideoFacebook } from "@/features/fotos/types";
import { formatDuracion } from "@/features/fotos/types";

interface VideoCardProps {
  video: VideoFacebook;
  onSelect: (video: VideoFacebook) => void;
}

export function VideoCard({ video, onSelect }: VideoCardProps) {
  const duracion = formatDuracion(video.durationSec);
  const anio = video.createdAt.slice(0, 4);

  return (
    <figure className="group relative mb-4 break-inside-avoid overflow-hidden rounded-lg border border-neutral-800 bg-[#111] transition-all duration-300 hover:border-[#dc2626]/60">
      <div className="relative">
        <div className="relative aspect-video overflow-hidden bg-neutral-900">
          <Image
            src={video.thumbnail}
            alt={`Video: ${video.description || "registro en video de la movida"}`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-300 ease-in-out group-hover:scale-[1.02]"
            unoptimized
          />

          <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/10">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/80 bg-black/50 text-white backdrop-blur transition-transform duration-300 group-hover:scale-110">
              <Play size={18} className="ml-0.5" aria-hidden="true" />
            </span>
          </div>

          {duracion && (
            <span className="absolute bottom-2 right-2 z-10 rounded-sm bg-black/80 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-white backdrop-blur">
              {duracion}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onSelect(video)}
          aria-label={`Ver video: ${video.description || "registro en video de la movida"}`}
          className="absolute inset-0 z-0"
        />

        {anio && (
          <span className="absolute left-2 top-2 z-10 rounded-sm bg-black/70 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-widest text-neutral-200 backdrop-blur">
            {anio}
          </span>
        )}
      </div>

      {video.description && (
        <figcaption className="pointer-events-none px-3 pb-3 pt-2.5">
          <p className="line-clamp-2 text-xs leading-relaxed text-neutral-400">
            {video.description}
          </p>
        </figcaption>
      )}
    </figure>
  );
}
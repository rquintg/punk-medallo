import Image from "next/image";
import type { FotoFacebook } from "@/features/fotos/types";
import {
  FOTO_ALT_FALLBACK,
  srcMasCercana,
} from "@/features/fotos/types";

const DIA_NUEVO = 30 * 86_400_000;

interface FotoCardProps {
  foto: FotoFacebook;
  onSelect: (foto: FotoFacebook) => void;
}

function esNueva(foto: FotoFacebook): boolean {
  const t = new Date(foto.createdAt).getTime();
  return isFinite(t) && Date.now() - t < DIA_NUEVO;
}

export function FotoCard({ foto, onSelect }: FotoCardProps) {
  const src = srcMasCercana(foto, 800);
  const anio = foto.createdAt.slice(0, 4);

  return (
    <figure className="group relative mb-4 break-inside-avoid overflow-hidden rounded-lg border border-neutral-800 bg-[#111] transition-all duration-300 hover:border-[#dc2626]/60">
      <div className="relative">
        <Image
          src={src}
          alt={foto.altText && !foto.altText.startsWith("No hay ninguna") ? foto.altText : foto.name || FOTO_ALT_FALLBACK}
          width={foto.width}
          height={foto.height}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="h-auto w-full object-cover transition duration-300 ease-in-out group-hover:scale-[1.02]"
          unoptimized
        />

        <button
          type="button"
          onClick={() => onSelect(foto)}
          aria-label={`Ver foto: ${foto.name || "registro fotográfico sin título"}`}
          className="absolute inset-0 z-0"
        />

        {anio && (
          <span className="absolute left-2 top-2 z-10 rounded-sm bg-black/70 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-widest text-neutral-200 backdrop-blur">
            {anio}
          </span>
        )}

        {esNueva(foto) && (
          <span className="absolute right-2 top-2 z-10 rounded-sm bg-[#dc2626] px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-widest text-white">
            NUEVO
          </span>
        )}
      </div>

      {foto.name && (
        <figcaption className="pointer-events-none px-3 pb-3 pt-2.5">
          <p className="line-clamp-2 text-xs leading-relaxed text-neutral-400">
            {foto.name}
          </p>
        </figcaption>
      )}
    </figure>
  );
}
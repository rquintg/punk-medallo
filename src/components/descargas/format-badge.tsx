import type { AlbumFormat } from "@/features/descargas/types";
import { ALBUM_FORMAT_LABELS } from "@/features/descargas/utils/album";

const FORMAT_STYLES: Record<AlbumFormat, string> = {
  album: "border-neutral-600 text-neutral-300",
  ep: "border-red-800 text-red-400",
  demo: "border-neutral-700 text-neutral-400",
  discografia: "border-amber-700 text-amber-300",
  compilado: "border-purple-800 text-purple-300",
  split: "border-cyan-800 text-cyan-300",
  en_vivo: "border-orange-800 text-orange-300",
};

export function FormatBadge({ format }: { format: AlbumFormat }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm border bg-black/60 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-widest backdrop-blur ${FORMAT_STYLES[format]}`}
    >
      {ALBUM_FORMAT_LABELS[format]}
    </span>
  );
}

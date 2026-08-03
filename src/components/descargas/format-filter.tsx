"use client";

import type { AlbumFormat } from "@/features/descargas/types";
import { ALBUM_FORMAT_LABELS } from "@/features/descargas/utils/album";

interface FormatFilterProps {
  active: string | null;
  onChange: (format: string | null) => void;
}

const FORMATS = Object.keys(ALBUM_FORMAT_LABELS) as AlbumFormat[];

export function FormatFilter({ active, onChange }: FormatFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`rounded-full border px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-widest transition-colors ${
          active === null
            ? "border-[#dc2626] bg-[#dc2626] text-white"
            : "border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-white"
        }`}
        aria-pressed={active === null}
      >
        Todos
      </button>
      {FORMATS.map((format) => (
        <button
          key={format}
          type="button"
          onClick={() => onChange(active === format ? null : format)}
          className={`rounded-full border px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-widest transition-colors ${
            active === format
              ? "border-[#dc2626] bg-[#dc2626] text-white"
              : "border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-white"
          }`}
          aria-pressed={active === format}
        >
          {ALBUM_FORMAT_LABELS[format]}
        </button>
      ))}
    </div>
  );
}

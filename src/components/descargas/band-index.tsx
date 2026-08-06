"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, X } from "lucide-react";
import type { BandInfo } from "@/features/descargas/types";
import { bandSlug } from "@/features/descargas/utils/album";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

interface BandIndexProps {
  bands: BandInfo[];
  activeLetter: string | null;
  onLetterChange: (letter: string | null) => void;
}

export function BandIndex({
  bands,
  activeLetter,
  onLetterChange,
}: BandIndexProps) {
  const [showAll, setShowAll] = useState(false);
  const presentLetters = new Set(bands.map((band) => band.letter));

  const filteredBands = activeLetter
    ? bands.filter((band) => band.letter === activeLetter)
    : bands;

  return (
    <div className="border-b border-neutral-800 bg-[#0c0c0c]">
      <nav
        aria-label="Índice de bandas por letra"
        className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-3"
      >
        <button
          type="button"
          onClick={() => onLetterChange(null)}
          className={`shrink-0 rounded px-1.5 py-1 font-mono text-xs font-bold transition-colors ${
            activeLetter === null
              ? "bg-[#dc2626] text-white"
              : "text-neutral-400 hover:text-white"
          }`}
          aria-pressed={activeLetter === null}
        >
          TODAS
        </button>
        {ALPHABET.map((letter) => {
          const present = presentLetters.has(letter);
          return (
            <button
              key={letter}
              type="button"
              disabled={!present}
              onClick={() =>
                onLetterChange(activeLetter === letter ? null : letter)
              }
              aria-pressed={activeLetter === letter}
              className={`shrink-0 rounded px-1.5 py-1 font-mono text-xs font-bold transition-colors ${
                activeLetter === letter
                  ? "bg-[#dc2626] text-white"
                  : present
                    ? "text-neutral-300 hover:text-white"
                    : "cursor-not-allowed text-neutral-700"
              }`}
            >
              {letter}
            </button>
          );
        })}
      </nav>

      <div className="mx-auto max-w-6xl px-4 pb-4">
        <button
          type="button"
          onClick={() => setShowAll((value) => !value)}
          className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-neutral-500 transition-colors hover:text-[#dc2626]"
          aria-expanded={showAll}
        >
          <ChevronDown
            size={13}
            className={`transition-transform ${showAll ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
          Ver todas las bandas ({bands.length})
        </button>

        {showAll && (
          <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3 md:grid-cols-4">
            {filteredBands.map((band) => (
              <li key={band.normalized}>
                <Link
                  href={`/descargas/banda/${bandSlug(band.name)}`}
                  className="group flex w-full items-baseline justify-between gap-2 border-b border-neutral-800/60 pb-1 text-left"
                >
                  <span className="truncate text-sm text-neutral-300 transition-colors group-hover:text-[#dc2626]">
                    {band.name}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-neutral-600">
                    {band.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {activeLetter && (
          <div className="mt-3 flex items-center gap-2 font-mono text-xs text-neutral-400">
            <button
              type="button"
              onClick={() => onLetterChange(null)}
              className="flex items-center gap-1 rounded border border-[#dc2626]/50 bg-[#dc2626]/10 px-2 py-1 text-[#dc2626] transition-colors hover:bg-[#dc2626]/20"
            >
              Letra {activeLetter}
              <X size={11} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

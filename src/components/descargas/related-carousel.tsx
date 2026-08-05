"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Album } from "@/features/descargas/types";
import { AlbumCard } from "./album-card";

interface RelatedCarouselProps {
  title: string;
  albums: Album[];
}

export function RelatedCarousel({ title, albums }: RelatedCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows]);

  const scrollByCard = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("article")?.clientWidth ?? 256;
    el.scrollBy({ left: direction * (cardWidth + 16), behavior: "smooth" });
  };

  if (albums.length === 0) return null;

  return (
    <section className="mt-16" aria-label="Lanzamientos relacionados">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
          {title}
        </h2>
        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            disabled={!canScrollLeft}
            aria-label="Ver anteriores"
            className="flex h-8 w-8 items-center justify-center rounded border border-neutral-700 bg-[#111] text-neutral-300 transition-colors hover:border-[#dc2626] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            disabled={!canScrollRight}
            aria-label="Ver siguientes"
            className="flex h-8 w-8 items-center justify-center rounded border border-neutral-700 bg-[#111] text-neutral-300 transition-colors hover:border-[#dc2626] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {albums.map((album) => (
          <div key={album.slug} className="w-60 shrink-0 snap-start sm:w-64">
            <AlbumCard album={album} />
          </div>
        ))}
      </div>
    </section>
  );
}

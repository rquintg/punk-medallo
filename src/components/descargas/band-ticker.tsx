"use client";

import { useLayoutEffect, useRef } from "react";
import { LucideSlash } from "lucide-react";
import type { BandInfo } from "@/features/descargas/types";

const TICKER_SPEED_PX_PER_SEC = 55;
const MIN_DURATION_SEC = 25;

export function BandTicker({ bands }: { bands: BandInfo[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const updateDuration = () => {
      const halfWidth = track.scrollWidth / 2;
      const duration = Math.max(
        halfWidth / TICKER_SPEED_PX_PER_SEC,
        MIN_DURATION_SEC
      );
      track.style.setProperty("--marquee-duration", `${duration}s`);
    };
    updateDuration();
    const observer = new ResizeObserver(updateDuration);
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  if (bands.length === 0) return null;
  const names = bands.map((band) => band.name.toUpperCase());
  const doubled = [...names, ...names];

  return (
    <div className="relative overflow-hidden border-y border-neutral-800 bg-[#0c0c0c] py-3">
      <div
        ref={trackRef}
        aria-hidden="true"
        className="flex w-max animate-marquee whitespace-nowrap font-mono text-xs tracking-[0.25em] text-neutral-500"
      >
        {doubled.map((name, index) => (
          <span
            key={`${name}-${index}`}
            className="mx-6 flex items-center gap-12"
          >
            <span>{name}</span>
            <LucideSlash
              size={13}
              aria-hidden="true"
              className="shrink-0 text-[#dc2626]"
            />
          </span>
        ))}
      </div>
    </div>
  );
}

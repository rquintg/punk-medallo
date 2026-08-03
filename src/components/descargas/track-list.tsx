import { Music } from "lucide-react";

export function TrackList({ tracks }: { tracks: string[] }) {
  if (tracks.length === 0) return null;

  return (
    <section aria-label="Lista de canciones">
      <h2 className="mb-4 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
        <Music size={13} aria-hidden="true" />
        Track list
      </h2>
      <ol className="divide-y divide-neutral-800 border-y border-neutral-800">
        {tracks.map((track, index) => (
          <li key={`${track}-${index}`}>
            <span className="group flex items-baseline gap-4 py-2.5 transition-colors hover:bg-neutral-900/60">
              <span className="w-7 shrink-0 text-right font-mono text-xs text-[#dc2626]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-sm text-neutral-200 transition-colors group-hover:text-white">
                {track}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/**
 * Reproductor embebido de transmision en vivo (YouTube/Facebook/otro).
 * Server component — se renderiza solo cuando mostrarLive && liveUrl.
 */
export default function LiveStream({ embedUrl }: { embedUrl: string }) {
  return (
    <section id="en-vivo" className="relative w-full bg-[#111] border-b-2 border-[#a40202] pt-20">
      <div className="mx-auto max-w-3xl px-4 pb-8">
        <p className="mb-4 flex items-center justify-center gap-2 text-center text-sm font-black uppercase tracking-[0.3em] text-white">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600" />
          </span>
          En vivo ahora
        </p>
        <div className="overflow-hidden rounded-lg border border-[rgba(164,2,2,0.4)] shadow-lg shadow-black/40">
          <iframe
            src={embedUrl}
            title="Transmisión en vivo"
            className="aspect-video w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>
    </section>
  )
}

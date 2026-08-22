import { SITE_URL } from '@/features/tienda/utils/seo'

const SHARE_URL = `${SITE_URL}/#en-vivo`

/**
 * Reproductor embebido de transmision en vivo (YouTube/Facebook/otro).
 * Server component — se renderiza solo cuando mostrarLive && liveUrl.
 */
export default function LiveStream({
  embedUrl,
  titulo,
}: {
  embedUrl: string
  titulo?: string | null
}) {
  const waShare = `https://wa.me/?text=${encodeURIComponent(`🔴 Estamos EN VIVO en Punk Medallo — ${SHARE_URL}`)}`
  const fbShare = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SHARE_URL)}`

  return (
    <section id="en-vivo" className="relative w-full overflow-hidden border-b-2 border-[#a40202] bg-[#0d0d0d] pt-20 pb-10">
      {/* Glow rojo radial de fondo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 60% 55% at 50% 35%, rgba(220,38,38,0.16), transparent 70%)' }}
      />

      <div className="relative mx-auto max-w-3xl px-4 xl:max-w-4xl">
        {/* Titulo (configurable desde admin) */}
        <h2 className="mb-1 -skew-x-1 text-center text-2xl font-black uppercase italic tracking-wide text-white [text-shadow:0_2px_14px_rgba(220,38,38,0.5)] sm:text-3xl">
          {titulo || 'En vivo ahora'}
        </h2>
        <p className="mb-6 text-center font-mono text-[11px] uppercase tracking-[0.35em] text-neutral-500">
          punkmedallo.com · señal directa
        </p>

        {/* Marco del reproductor con borde latiendo */}
        <div className="animate-live-border relative rounded-xl border-2 border-red-600/75 p-2 sm:p-3">
          {/* Indicador EN VIVO */}
          <span className="absolute -top-3 left-4 z-10 flex items-center gap-1.5 rounded-full border border-red-600/60 bg-black/90 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-80" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            En vivo
          </span>

          {/* Sticker DIRECTO */}
          <span className="absolute -top-4 right-6 z-10 rotate-[-6deg] rounded-sm border border-black bg-[#dc2626] px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-[3px_3px_0_rgba(0,0,0,0.7)]">
            Directo
          </span>

          {/* Video con esquinas visor */}
          <div className="relative overflow-hidden rounded-lg">
            <span aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-10 h-5 w-5 border-l-2 border-t-2 border-white/70" />
            <span aria-hidden="true" className="pointer-events-none absolute right-0 top-0 z-10 h-5 w-5 border-r-2 border-t-2 border-white/70" />
            <span aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 z-10 h-5 w-5 border-b-2 border-l-2 border-white/70" />
            <span aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 z-10 h-5 w-5 border-b-2 border-r-2 border-white/70" />
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

        {/* Compartir */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <span className="text-xs uppercase tracking-widest text-neutral-500">Comparte la transmisión</span>
          <a
            href={waShare}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-700 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 transition-colors hover:bg-emerald-950/40"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </a>
          <a
            href={fbShare}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-blue-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-400 transition-colors hover:bg-blue-950/30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </a>
        </div>
      </div>
    </section>
  )
}

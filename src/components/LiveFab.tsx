import Link from 'next/link'

/**
 * Boton flotante "EN VIVO" / "REVIVE" para paginas distintas al inicio.
 * Server component — solo es un link animado con CSS (cero JS).
 * revive: version ambar sin urgencia (replay).
 */
export default function LiveFab({ revive = false }: { revive?: boolean }) {
  return (
    <Link
      href="/#en-vivo"
      aria-label={revive ? 'Revive la transmisión' : 'Ver transmisión en vivo'}
      className={
        revive
          ? 'fixed right-3 top-20 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-600 to-amber-800 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-[0_0_18px_rgba(245,158,11,0.4)] transition-shadow hover:shadow-[0_0_28px_rgba(245,158,11,0.6)]'
          : 'animate-fab-wiggle fixed right-3 top-20 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-red-800 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-[0_0_24px_rgba(220,38,38,0.55)] transition-shadow hover:shadow-[0_0_36px_rgba(220,38,38,0.8)]'
      }
    >
      <span className="relative flex h-2.5 w-2.5">
        {!revive && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-80" />
        )}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${revive ? 'bg-amber-300' : 'bg-white'}`} />
      </span>
      {revive ? 'Revive' : 'En vivo'}
    </Link>
  )
}

import Link from 'next/link'

/**
 * Boton flotante "EN VIVO" para paginas distintas al inicio.
 * Server component — solo es un link animado con CSS (cero JS).
 */
export default function LiveFab() {
  return (
    <Link
      href="/#en-vivo"
      className="animate-fab-wiggle fixed right-3 top-20 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-red-800 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-[0_0_24px_rgba(220,38,38,0.55)] transition-shadow hover:shadow-[0_0_36px_rgba(220,38,38,0.8)]"
      aria-label="Ver transmisión en vivo"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-80" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
      </span>
      En vivo
    </Link>
  )
}

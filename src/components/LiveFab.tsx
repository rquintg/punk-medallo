import Link from 'next/link'

/**
 * Boton flotante "EN VIVO" para paginas distintas al inicio.
 * Server component — solo es un link animado con CSS (cero JS).
 */
export default function LiveFab() {
  return (
    <Link
      href="/#en-vivo"
      className="fixed right-3 top-20 z-40 flex items-center gap-2 rounded-full border border-[#a40202] bg-black/90 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-black/50 backdrop-blur transition-transform hover:scale-105"
      aria-label="Ver transmisión en vivo"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
      </span>
      En vivo
    </Link>
  )
}

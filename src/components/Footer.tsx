import Link from 'next/link';
import { Mail, Disc3, ShoppingBag, Radio, Users, FileText, Shield, Headphones } from 'lucide-react';
import PaymentBadges from '@/components/tienda/payment-badges';

export default function Footer() {
  const year = new Date().getFullYear();
  const mesYAnio = new Intl.DateTimeFormat('es-CO', { month: 'short', year: 'numeric' }).format(new Date());

  return (
    <footer className="relative mt-16 w-full border-t border-white/[0.06] bg-[#080808]">
      {/* glow sutil arriba */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/[0.04] to-transparent" />

      <div className="relative mx-auto max-w-6xl px-6 py-10 sm:px-8 lg:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.9fr_0.9fr_1fr]">
          {/* Marca */}
          <div>
            <Link href="/" className="inline-flex items-baseline gap-1.5">
              <span className="text-xl font-black uppercase tracking-tight text-white">Punk</span>
              <span className="text-xl font-black uppercase tracking-tight text-primary">Medallo</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Archivo vivo del punk de Medellín. Radio 24/7, descargas, fotos, toques y tienda — todo en un solo lugar.
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                <Radio size={14} />
              </span>
              <span>Radio 24/7</span>
              <span className="h-1 w-1 rounded-full bg-primary/60" />
              <span>Medellín</span>
              <span className="h-1 w-1 rounded-full bg-primary/60" />
              <span>Desde 2009</span>
            </div>
            <a href="mailto:info@punkmedallo.com" className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white">
              <Mail size={14} className="text-primary" /> info@punkmedallo.com
            </a>
          </div>

          {/* Navegación */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white">Navegación</h4>
            <ul className="mt-4 space-y-2.5">
              {[
                { href: '/', label: 'Inicio', Icon: Disc3 },
                { href: '/descargas', label: 'Descargas', Icon: FileText },
                { href: '/fotos', label: 'Registro Fotográfico', Icon: Users },
                { href: '/eventos', label: 'Toques', Icon: Headphones },
                { href: '/about', label: 'Acerca de', Icon: Users },
                { href: '/amigos', label: 'Páginas Amigas', Icon: Users },
                { href: '/editor-mp3', label: 'Editor MP3', Icon: FileText },
                { href: '/contacto', label: 'Contacto', Icon: Mail },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white">
                    <l.Icon size={14} className="text-primary/70 group-hover:text-primary" /> {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tienda & Legal */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white">Tienda & Legal</h4>
            <ul className="mt-4 space-y-2.5">
              {[
                { href: '/tienda', label: 'Tienda', Icon: ShoppingBag },
                { href: '/tienda/ofertas', label: 'Ofertas', Icon: ShoppingBag },
                { href: '/boletas', label: 'Boletas', Icon: Headphones },
                { href: '/tienda/rastrear', label: 'Rastrear pedido', Icon: Shield },
                { href: '/terminos', label: 'Términos', Icon: FileText },
                { href: '/politica-de-privacidad', label: 'Privacidad', Icon: Shield },
                { href: '/politica-de-cookies', label: 'Cookies', Icon: Shield },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white">
                    <l.Icon size={14} className="text-primary/70 group-hover:text-primary" /> {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Redes + Newsletter tease */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h4 className="text-xs font-black uppercase tracking-widest text-white">Conecta</h4>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Síguenos y no te pierdas ningún toque.</p>
            <div className="mt-4 flex gap-2.5">
              <a href="https://www.facebook.com/xPUNKMEDALLOx" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white backdrop-blur hover:bg-primary hover:border-primary hover:text-white transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
              </a>
              <a href="https://www.instagram.com/punk.medallo" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white backdrop-blur hover:bg-primary hover:border-primary hover:text-white transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
              </a>
              <a href="https://www.youtube.com/punkmedallo" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white backdrop-blur hover:bg-primary hover:border-primary hover:text-white transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" /></svg>
              </a>
            </div>
            <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
              <p className="text-xs font-bold uppercase tracking-widest text-white">¿Tienes una banda?</p>
              <p className="mt-1 text-sm text-muted-foreground">Escríbenos para aparecer en descargas.</p>
              <Link href="/contacto" className="mt-3 inline-flex rounded-full bg-primary px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-primary-hover">
                Ir a contacto
              </Link>
            </div>
          </div>
        </div>

        {/* bottom bar */}
        <div className="mt-6 border-t border-white/10 pt-4">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-1 text-center sm:text-left order-2 lg:order-1">
              <p className="text-xs font-bold uppercase tracking-widest text-white/70">
                © {year} Punk Medallo — Todos los derechos reservados
              </p>
              <p className="text-xs text-muted-foreground">
                Desarrollado por <span className="font-semibold text-white">Ricardo Q</span> · Actualizado {mesYAnio}
              </p>
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-center text-[11px] font-black uppercase tracking-[0.18em] text-white/40 lg:text-right">Aceptamos:</p>
              <div className="mt-3">
                <PaymentBadges label="" hideEfectivo={false} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

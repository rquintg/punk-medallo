"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Radio, Menu, X } from "lucide-react";

const navLinksBase = [
  { href: "/", label: "Inicio" },
  { href: "/about", label: "Acerca de" },
  { href: "/eventos", label: "Toques" },
  { href: "/descargas", label: "Descargas" },
  { href: "/fotos", label: "Registro Fotográfico" },
];

export default function NavBar(_props: { tiendaActiva?: boolean; boleteriaActiva?: boolean } = {}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    ...navLinksBase.slice(0, 3),
    { href: "/boletas", label: "Boletas" } as const,
    ...navLinksBase.slice(3),
    { href: "/tienda", label: "Tienda" } as const,
  ]

  const pageTitles: Record<string, string> = {
    "/": "Punk Medallo",
    "/eventos": "Próximos Eventos",
    "/boletas": "Boletas y Conciertos",
    "/descargas": "Descargar Música",
    "/fotos": "Registro Fotográfico",
    "/about": "Acerca de",
    "/contacto": "Contacto",
    "/tienda": "Tienda",
  };

  const pageTitle = pageTitles[pathname];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <nav
        className={`animate-nav-drop fixed top-0 left-0 right-0 w-full z-[1000] border-b transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]
          ${
            isScrolled
              ? "bg-white/[0.03] backdrop-blur-lg backdrop-saturate-150 border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
              : "bg-transparent backdrop-blur-[2px] border-white/5"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div
            className={`flex items-center transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isScrolled ? "py-3" : "py-4"
            }`}
          >
            {/* Radio icon */}
            <Link
              href="/"
              className="inline-flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:rotate-[-15deg] hover:scale-110 shrink-0"
            >
              <Radio
                size={30}
                className="text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.4)] transition-all duration-300"
              />
            </Link>

            {/* Page Title */}
            {pageTitle && (
              <span className="text-white text-xl font-bold tracking-wide truncate ml-3 max-sm:hidden">
                {pageTitle}
              </span>
            )}

            {/* Radio — Centro en móvil */}
            <Link
              href="/radio"
              className={`lg:hidden absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-widest border transition-all ${pathname === "/radio" ? "bg-primary border-primary text-white shadow-[0_0_12px_rgba(220,38,38,0.7)]" : "bg-surface/90 border-primary text-primary hover:bg-primary hover:text-white"}`}
            >
              <span className={`h-2 w-2 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.9)] animate-pulse ${pathname === "/radio" ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "bg-primary group-hover:bg-white"}`} />
              Radio
              <span className="hidden xs:inline">· En vivo</span>
            </Link>

            {/* Mobile Toggler */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden flex items-center justify-center p-2 rounded transition-all duration-300 ml-auto ${
                isScrolled
                  ? "border border-primary/60 bg-primary/5 hover:bg-primary/10 focus:shadow-[0_0_0_0.25rem_rgba(220,38,38,0.3)]"
                  : "border border-primary bg-primary/15 hover:bg-primary/25 shadow-[0_0_12px_rgba(220,38,38,0.3)]"
              }`}
              aria-controls="navbarNav"
              aria-expanded={isMenuOpen}
              aria-label="Toggle navigation"
            >
              {isMenuOpen ? (
                <X className="text-primary" size={24} />
              ) : (
                <Menu className="text-primary" size={24} />
              )}
            </button>

            {/* Nav Links */}
            <div
              id="navbarNav"
              className={`${
                isMenuOpen ? "block" : "hidden"
              } lg:flex lg:items-center lg:gap-1 lg:ml-auto absolute lg:static top-full left-0 right-0 lg:backdrop-filter-none
                max-lg:backdrop-blur max-lg:bg-surface/70 max-lg:rounded-b-lg max-lg:border-t max-lg:border-primary/20
                max-lg:px-4 max-lg:pb-4`}
            >
              <ul className="flex flex-col lg:flex-row lg:items-center lg:gap-1 max-lg:text-right">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <li key={link.href} className="nav-item">
                      <Link
                        href={link.href}
                        className={`relative inline-block px-3 py-2 text-sm font-semibold uppercase tracking-[0.5px] transition-all duration-300
                          ${
                            isActive
                              ? "text-primary"
                              : "text-white/90 hover:text-primary hover:text-shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                          }
                          after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-gradient-to-r after:from-primary after:to-primary
                          after:transition-all after:duration-300 after:ease-[cubic-bezier(0.4,0,0.2,1)]
                          ${
                            isActive
                              ? "after:w-full"
                              : "after:w-0 hover:after:w-full"
                          }
                          max-lg:after:hidden
                          max-lg:block max-lg:py-3 max-lg:px-0
                          ${
                            isActive || isMenuOpen
                              ? "max-lg:pl-4 max-lg:hover:pl-4"
                              : ""
                          }
                        `}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* Radio — Mobile (dentro del drawer) */}
              <Link
                href="/radio"
                className={`lg:hidden mt-4 flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-black uppercase tracking-widest border group ${pathname === "/radio" ? "bg-primary border-primary text-white" : "bg-surface/90 border-primary text-primary hover:bg-primary hover:text-white"}`}
              >
                <span className={`h-2.5 w-2.5 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.9)] animate-pulse ${pathname === "/radio" ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" : "bg-primary group-hover:bg-white"}`} />
                Radio — En vivo
              </Link>

              {/* Divider + Radio LIVE — Desktop */}
              <div className="hidden lg:flex lg:items-center">
                <div className="w-px h-6 bg-primary/50 mx-2" />
                <Link
                  href="/radio"
                  className={`group flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest transition-all duration-300 border ${pathname === "/radio" ? "bg-primary border-primary text-white shadow-[0_0_15px_rgba(220,38,38,0.6)]" : "bg-surface/90 border-primary text-primary hover:bg-primary hover:text-white hover:shadow-[0_0_15px_rgba(220,38,38,0.5)]"}`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.9)] animate-pulse ${pathname === "/radio" ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" : "bg-primary group-hover:bg-white"}`} />
                  Radio
                  <span className="hidden xl:inline font-bold">- En vivo</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

    </>
  );
}

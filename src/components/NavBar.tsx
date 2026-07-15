"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Radio, Menu, X } from "lucide-react";
import SongRequest from "./SongRequest";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/about", label: "Acerca de" },
  { href: "/eventos", label: "Toques" },
  { href: "/descargas", label: "Descargas" },
  { href: "/fotos", label: "Registro Fotográfico" },
  { href: "/amigos", label: "Páginas Amigas" },
];

export default function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSongRequestOpen, setIsSongRequestOpen] = useState(false);
  const pathname = usePathname();

  const pageTitles: Record<string, string> = {
    "/": "Punk Medallo",
    "/eventos": "Próximos Eventos",
    "/descargas": "Descargar Música",
    "/fotos": "Registro Fotográfico",
    "/about": "Acerca de",
    "/amigos": "Páginas Amigas",
    "/contacto": "Contacto",
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
        className={`fixed top-0 left-0 right-0 w-full z-[1000] border-b transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]
          ${
            isScrolled
              ? "bg-gradient-to-br from-[rgba(20,20,20,0.85)] to-[rgba(40,0,0,0.75)] backdrop-blur shadow-[0_8px_32px_0_rgba(164,2,2,0.15)] border-[rgba(164,2,2,0.3)]"
              : "bg-transparent border-transparent"
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
                className="text-[#ff3200] drop-shadow-[0_0_8px_rgba(164,2,2,0.4)] transition-all duration-300"
              />
            </Link>

            {/* Page Title */}
            {pageTitle && (
              <span className="text-white text-xl font-bold tracking-wide truncate ml-3 max-sm:hidden">
                {pageTitle}
              </span>
            )}

            {/* Mobile Toggler */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden flex items-center justify-center p-2 rounded transition-all duration-300 ml-auto ${
                isScrolled
                  ? "border border-[rgba(164,2,2,0.6)] bg-[rgba(164,2,2,0.05)] hover:bg-[rgba(164,2,2,0.1)] focus:shadow-[0_0_0_0.25rem_rgba(164,2,2,0.3)]"
                  : "border-2 border-[#ff4444] bg-[rgba(255,68,68,0.15)] hover:bg-[rgba(255,68,68,0.25)] shadow-[0_0_12px_rgba(255,68,68,0.3)]"
              }`}
              aria-controls="navbarNav"
              aria-expanded={isMenuOpen}
              aria-label="Toggle navigation"
            >
              {isMenuOpen ? (
                <X className="text-[#ff4444]" size={24} />
              ) : (
                <Menu className="text-[#ff4444]" size={24} />
              )}
            </button>

            {/* Nav Links */}
            <div
              id="navbarNav"
              className={`${
                isMenuOpen ? "block" : "hidden"
              } lg:flex lg:items-center lg:gap-1 lg:ml-auto absolute lg:static top-full left-0 right-0 lg:backdrop-filter-none
                max-lg:backdrop-blur max-lg:bg-[rgba(20,20,20,0.7)] max-lg:rounded-b-lg max-lg:border-t max-lg:border-[rgba(164,2,2,0.2)]
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
                              ? "text-[#ff4444]"
                              : "text-white/90 hover:text-[#ff4444] hover:text-shadow-[0_0_10px_rgba(164,2,2,0.5)]"
                          }
                          after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-gradient-to-r after:from-[#a40202] after:to-[#ff4444]
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

              {/* Divider + Song Request Button - Desktop */}
              <div className="hidden lg:flex lg:items-center">
                <div className="w-px h-6 bg-[rgba(164,2,2,0.5)] mx-2" />
                <button
                  onClick={() => setIsSongRequestOpen(true)}
                  className="border border-[#a40202] text-[#ff4444] font-bold tracking-[0.5px] uppercase px-4 py-2 text-sm rounded transition-all duration-300 backdrop-blur bg-[rgba(164,2,2,0.1)] hover:bg-[rgba(164,2,2,0.25)] hover:border-[#ff4444] hover:shadow-[0_0_15px_rgba(164,2,2,0.4)] hover:-translate-y-[2px] active:translate-y-0 focus:shadow-[0_0_0_0.25rem_rgba(164,2,2,0.25)]"
                >
                  Pide tu canción
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <SongRequest
        isOpen={isSongRequestOpen}
        onClose={() => setIsSongRequestOpen(false)}
      />
    </>
  );
}

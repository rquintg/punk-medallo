import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  const mesYAnio = new Intl.DateTimeFormat("es-ES", {
    month: "short",
    year: "numeric",
  }).format(new Date());

  return (
    <footer className="bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] text-[#d0d0d0] border-t-2 border-[#a40202] px-8 pt-16 pb-8 w-full mt-16 max-md:px-6 max-md:pt-12 max-md:pb-6 max-md:mt-12 max-sm:px-4 max-sm:pt-8 max-sm:pb-4 max-sm:grid-cols-1">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-12 max-w-[1300px] mx-auto mb-12 max-md:gap-8 max-md:mb-8 max-sm:gap-6 max-sm:mb-6">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <h3 className="text-[#a40202] text-2xl font-black m-0 tracking-wider uppercase max-md:text-xl max-sm:text-base">
            Punk Medallo
          </h3>
          <p className="text-[#b0b0b0] text-[0.95rem] leading-relaxed m-0 max-md:text-sm">
            Transmisión 24/7 de puro punk, hardcore y alternativo. Pirateamos el
            sistema, una canción a la vez.
          </p>
        </div>

        {/* Enlaces */}
        <div className="flex flex-col gap-4">
          <h4 className="text-white text-base font-bold m-0 tracking-wide uppercase max-md:text-sm">
            Enlaces
          </h4>
          <ul className="list-none p-0 m-0 flex flex-col gap-3">
            {[
              { href: "/", label: "Inicio" },
              { href: "/about", label: "Acerca de" },
              { href: "/descargas", label: "Blog" },
              { href: "/contacto", label: "Contacto" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[#d0d0d0] no-underline text-sm transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] inline-block hover:text-[#a40202] hover:pl-2"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Redes Sociales */}
        <div className="flex flex-col gap-4">
          <h4 className="text-white text-base font-bold m-0 tracking-wide uppercase max-md:text-sm">
            Redes Sociales
          </h4>
          <ul className="list-none p-0 m-0 flex gap-6">
            <li>
              <a
                href="https://www.facebook.com/xPUNKMEDALLOx"
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook"
                className="text-[#d0d0d0] no-underline text-2xl inline-flex items-center justify-center w-10 h-10 rounded-full bg-[rgba(164,2,2,0.1)] border-2 border-transparent transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:text-white hover:bg-[rgba(164,2,2,0.3)] hover:border-[#a40202] hover:-translate-y-1 max-sm:w-9 max-sm:h-9 max-sm:text-xl"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/punk.medallo"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
                className="text-[#d0d0d0] no-underline text-2xl inline-flex items-center justify-center w-10 h-10 rounded-full bg-[rgba(164,2,2,0.1)] border-2 border-transparent transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:text-white hover:bg-[rgba(164,2,2,0.3)] hover:border-[#a40202] hover:-translate-y-1 max-sm:w-9 max-sm:h-9 max-sm:text-xl"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
            </li>
            <li>
              <a
                href="https://www.youtube.com/punkmedallo"
                target="_blank"
                rel="noopener noreferrer"
                title="YouTube"
                className="text-[#d0d0d0] no-underline text-2xl inline-flex items-center justify-center w-10 h-10 rounded-full bg-[rgba(164,2,2,0.1)] border-2 border-transparent transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:text-white hover:bg-[rgba(164,2,2,0.3)] hover:border-[#a40202] hover:-translate-y-1 max-sm:w-9 max-sm:h-9 max-sm:text-xl"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="max-w-[1300px] mx-auto pt-8 border-t border-white/10 flex flex-col gap-3 text-center max-md:pt-6 max-sm:pt-6">
        <p className="text-[#a40202] text-sm font-bold m-0 tracking-[0.5px] max-sm:text-xs">
          © {year} Punk Medallo - Todos los derechos reservados
        </p>
        <p className="text-[#808080] text-[0.85rem] m-0 max-sm:text-xs">
          Desarrollado por <strong className="text-[#a40202]">Ricardo Q</strong>{" "}
          | Actualizado en {mesYAnio}
        </p>
      </div>
    </footer>
  );
}

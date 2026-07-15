import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Páginas Amigas - Punk Medallo",
  description:
    "Conecta con nuestras páginas amigas: proyectos independientes y alternativos de Medellín que comparten nuestra filosofía punk.",
  openGraph: {
    title: "Páginas Amigas - Punk Medallo",
    description:
      "Conecta con nuestras páginas amigas: proyectos independientes y alternativos de Medellín.",
    images: [
      {
        url: "https://punkmedallo.com/logo_punk_medallo.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
      },
    ],
  },
};

const friendPages = [
  {
    id: 1,
    name: "Imaginacción",
    image: "/images/amigos/imaginaccion.png",
    url: "https://imaginaccion-medallo.blogspot.com/",
    description: "Blog de arte y cultura alternativa",
  },
  {
    id: 2,
    name: "Mentes en Disturbio",
    image: "/images/amigos/mentes.jpg",
    url: "https://www.mentesendisturbio.com/",
    description: "Pensamiento crítico y análisis",
  },
  {
    id: 3,
    name: "El Sótano Fanzine",
    image: "/images/amigos/sotano.png",
    url: "https://archive.org/details/@el_s_tano_fanzine",
    description: "Archivo de fanzines independientes",
  },
];

export default function Amigos() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f8f9fa] flex flex-col">
      {/* Hero Section */}
      <div
        className="relative flex items-center justify-center h-[50vh] w-screen text-white z-[1] pt-20 bg-cover bg-center bg-no-repeat before:absolute before:inset-0 before:bg-gradient-to-br before:from-black/60 before:to-black/70 before:z-[1]"
        style={{ backgroundImage: "url('/images/fondo.jpeg')" }}
      >
        <div className="relative z-[2] text-center flex flex-col items-center gap-6 animate-[fadeInDown_0.8s_ease-out]">
          <h1 className="sr-only">Páginas Amigas</h1>
          <div className="animate-[fadeInDown_0.8s_ease-out]">
            <Image
              src="/images/Logo-Punk-Medallo-2024 Blanco.png"
              alt="Punk Medallo"
              width={480}
              height={160}
              className="w-[480px] h-auto max-w-[90vw] drop-shadow-[0_4px_6px_rgba(164,2,2,0.5)]"
              priority
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-[1200px] w-full mx-auto px-8 py-16 max-md:px-4 max-md:py-8">
        {/* Intro */}
        <section className="bg-[rgba(52,58,64,0.4)] p-10 rounded-xl border-l-[5px] border-[#a40202] backdrop-blur mb-16 animate-[fadeIn_0.8s_ease-out]">
          <p className="text-[1.1rem] leading-relaxed text-[#e0e0e0] m-0">
            En Punk Medallo creemos en la comunidad y en el apoyo mutuo entre
            proyectos alternativos. Aquí encontrarás las páginas de nuestros
            compañeros en la lucha por mantener viva la contracultura, el arte
            independiente y el pensamiento crítico. ¡Visítalos y apoya sus
            iniciativas!
          </p>
        </section>

        {/* Friends Grid */}
        <section className="mb-16">
          <h2 className="text-[2.5rem] font-black text-white mb-8 pb-4 border-b-[3px] border-[#a40202] inline-block tracking-wider max-md:text-[1.8rem]">
            Nuestros Aliados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {friendPages.map((friend) => (
              <div
                key={friend.id}
                className="bg-[rgba(52,58,64,0.3)] rounded-xl overflow-hidden border border-[#a40202]/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_25px_rgba(164,2,2,0.3)]"
              >
                <div className="relative overflow-hidden">
                  <Image
                    src={friend.image}
                    alt={friend.name}
                    width={400}
                    height={250}
                    className="w-full h-52 object-cover transition-transform duration-300 hover:scale-110"
                  />
                  <a
                    href={friend.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 hover:opacity-100 transition-opacity duration-300"
                  >
                    <span className="text-white text-lg font-semibold">
                      Visitar
                    </span>
                  </a>
                </div>
                <div className="p-5">
                  <h3 className="text-[1.2rem] font-bold text-[#a40202] mb-2">
                    {friend.name}
                  </h3>
                  <p className="text-[#d0d0d0] text-sm leading-relaxed mb-4">
                    {friend.description}
                  </p>
                  <a
                    href={friend.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#a40202] font-semibold hover:text-[#ff6b6b] transition-colors"
                  >
                    <span>Ver Página</span>
                    <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-[rgba(164,2,2,0.2)] to-[rgba(164,2,2,0.05)] p-12 rounded-xl text-center border-2 border-[#a40202] backdrop-blur">
          <h2 className="text-[2rem] text-white mb-4 font-black">
            ¿Tu proyecto es parte de la comunidad punk?
          </h2>
          <p className="text-[1.1rem] text-[#d0d0d0] mb-8">
            Si tienes un proyecto independiente o alternativo y te gustaría ser
            parte de nuestra red de páginas amigas, contáctanos.
          </p>
          <div className="flex gap-4 justify-center flex-wrap max-md:flex-col">
            <Link
              href="/contacto"
              className="bg-[#a40202] text-white px-8 py-3 rounded-md font-bold text-base border-2 border-[#a40202] transition-all duration-300 hover:bg-[#ff6b6b] hover:border-[#ff6b6b] hover:shadow-[0_6px_20px_rgba(164,2,2,0.4)] hover:scale-105 no-underline inline-block cursor-pointer tracking-wider max-md:w-full max-md:text-center"
            >
              Contacta con Nosotros
            </Link>
            <Link
              href="/"
              className="bg-transparent text-[#a40202] px-8 py-3 rounded-md font-bold text-base border-2 border-[#a40202] transition-all duration-300 hover:bg-[#a40202] hover:text-white hover:shadow-[0_6px_20px_rgba(164,2,2,0.4)] hover:scale-105 no-underline inline-block cursor-pointer tracking-wider max-md:w-full max-md:text-center"
            >
              Volver al Inicio
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

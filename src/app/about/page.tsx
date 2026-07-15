import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Guitar, Mic, Music, Zap, Radio, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Acerca de Punk Medallo",
  description:
    "Conoce la historia de Punk Medallo, la radio 24/7 que preserva y transmite lo mejor del punk local de Medellín. Autenticidad, libertad, comunidad y rebeldía.",
  openGraph: {
    title: "Acerca de Punk Medallo",
    description:
      "Conoce la historia de Punk Medallo, la radio 24/7 que preserva y transmite lo mejor del punk local de Medellín.",
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

const values = [
  {
    icon: Guitar,
    title: "Autenticidad",
    description:
      "música Under ground y genuina sin compromisos comerciales.",
  },
  {
    icon: Mic,
    title: "Libertad de Expresión",
    description:
      "Damos voz a artistas independientes y sus ideas revolucionarias.",
  },
  {
    icon: Music,
    title: "Comunidad",
    description:
      "Construimos una comunidad activa por la música.",
  },
  {
    icon: Zap,
    title: "Rebeldía",
    description:
      "Desafiamos lo establecido y celebramos el espíritu inconformista.",
  },
];

const offers = [
  {
    icon: Radio,
    title: "Transmisión en Vivo",
    description:
      "Disfruta de transmisiones las 24/7 con contenido punk y alternativo.",
  },
  {
    icon: FileText,
    title: "Blog de Contenido",
    description:
      "Lee artículos sobre música, artistas locales y eventos punk.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f8f9fa] flex flex-col">
      {/* Hero Section */}
      <div
        className="relative flex items-center justify-center h-[58vh] w-screen text-white z-[1] pt-20 bg-cover bg-center bg-no-repeat before:absolute before:inset-0 before:bg-gradient-to-br before:from-black/50 before:to-black/60 before:z-[1]"
        style={{ backgroundImage: "url('/images/fondo.jpeg')" }}
      >
        <div className="relative z-[2] text-center flex flex-col items-center gap-8">
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
        {/* Historia */}
        <section className="mb-20 animate-fade-in max-md:mb-12">
          <h2 className="text-[2.5rem] font-black text-white mb-8 pb-4 border-b-[3px] border-[#a40202] inline-block tracking-wider max-md:text-[1.8rem]">
            Historia
          </h2>
          <div className="bg-[rgba(52,58,64,0.5)] p-8 rounded-lg border-l-4 border-[#a40202] backdrop-blur max-md:p-4">
            <p className="text-[1.1rem] leading-relaxed text-[#e0e0e0] m-0 max-md:text-base">
              Punk Medallo no es regionalista ni ninguna de esas casualidades por
              la que se colectivizan falsamente algunos. Punk Medallo reúne las
              bandas provenientes de Medellín, por que las situaciones que
              confluyeron en los 80&apos;s particularmente en esta parte del mapa,
              hicieron posible un estilo contestatario frente a esas situaciones
              sobretodo en su discurso (letras) pero también en la música de
              agresión estética; que luego se convertirían en factores
              identitarios del punk de Medellín por el que se conocería en el
              resto de colombia y del mundo. Por lo tanto, Punk Medallo encuentra
              su identidad en la expresión de autorreconocimento de los jóvenes
              de ésa y esta época, ligada a las situaciones comunes, al gusto
              musical y a la camaradería (llámense parches o combos) y no en el
              regionalismo coincidencialmente marica.
              <br />
              <br />
              Este blog acuñó un término con el que se titularon 3 recopilaciones
              de punk en los años 80&apos;s y 90&apos;s que recogían toda la producción
              musical que en ese momento se había realizado, de forma
              autogestionada, en la ciudad de Medellín: &quot;PUNK MEDALLO CON LAS
              UÑAS (Vol I)&quot;, &quot;EL CARTEL PUNK DE MEDELLÍN (Vol II)&quot;, &quot;RUIDO DE
              CLOACAS (Vol III)&quot;. Este término fue adquiriendo una connotación
              extensiva que, en definidas cuentas, resumía el punk producido o
              gritado desde Medellín. Punk Medallo (el blog) es el intento por
              recuperar el mensaje de los k7&apos;s (&quot;obsoletos&quot; y casi perdidos) de
              aquel entonces y los mensajes del punk de ahora.
            </p>
          </div>
        </section>

        {/* Valores */}
        <section className="mb-20 animate-fade-in max-md:mb-12">
          <h2 className="text-[2.5rem] font-black text-white mb-8 pb-4 border-b-[3px] border-[#a40202] inline-block tracking-wider max-md:text-[1.8rem]">
            Promovemos
          </h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-8 mt-8 max-md:grid-cols-1">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-gradient-to-br from-[rgba(164,2,2,0.1)] to-[rgba(52,58,64,0.5)] p-8 rounded-lg border-2 border-[#a40202] text-center backdrop-blur transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_20px_rgba(164,2,2,0.3)] hover:border-[#ff6b6b]"
              >
                <span className="block mb-4">
                  <value.icon size={48} className="mx-auto" />
                </span>
                <h3 className="text-[1.3rem] text-[#a40202] mt-4 mb-2 font-bold">
                  {value.title}
                </h3>
                <p className="text-[#d0d0d0] text-[0.95rem] leading-relaxed m-0">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Qué Encuentras */}
        <section className="mb-20 animate-fade-in max-md:mb-12">
          <h2 className="text-[2.5rem] font-black text-white mb-8 pb-4 border-b-[3px] border-[#a40202] inline-block tracking-wider max-md:text-[1.8rem]">
            Qué Encuentras
          </h2>
          <div className="flex flex-col gap-6 mt-8">
            {offers.map((offer) => (
              <div
                key={offer.title}
                className="flex gap-6 bg-[rgba(52,58,64,0.4)] p-6 rounded-lg border-l-4 border-[#a40202] backdrop-blur transition-all duration-300 hover:bg-[rgba(52,58,64,0.6)] hover:shadow-[0_4px_12px_rgba(164,2,2,0.2)] max-md:flex-col max-md:text-center"
              >
                <span className="flex-shrink-0 flex items-center max-md:justify-center">
                  <offer.icon size={40} />
                </span>
                <div>
                  <h3 className="text-[1.2rem] text-[#a40202] mb-2 font-bold">
                    {offer.title}
                  </h3>
                  <p className="text-[#d0d0d0] m-0 leading-relaxed">
                    {offer.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-[rgba(164,2,2,0.2)] to-[rgba(164,2,2,0.05)] p-12 rounded-xl text-center border-2 border-[#a40202] backdrop-blur mt-12 max-md:p-8">
          <h2 className="text-[2rem] text-white mb-4 font-black">
            ¿Listo para escuchar?
          </h2>
          <p className="text-[1.1rem] text-[#d0d0d0] mb-8 m-0">
            Únete a nuestra comunidad y sé parte del movimiento punk.
          </p>
          <div className="flex gap-4 justify-center flex-wrap max-md:flex-col max-md:w-full">
            <Link
              href="/"
              className="bg-[#a40202] text-white px-8 py-3 rounded-md font-bold text-base border-2 border-[#a40202] transition-all duration-300 hover:bg-[#ff6b6b] hover:border-[#ff6b6b] hover:shadow-[0_6px_20px_rgba(164,2,2,0.4)] hover:scale-105 no-underline inline-block cursor-pointer tracking-wider max-md:w-full max-md:text-center"
            >
              Ir a Inicio
            </Link>
            <Link
              href="/descargas"
              className="bg-transparent text-[#a40202] px-8 py-3 rounded-md font-bold text-base border-2 border-[#a40202] transition-all duration-300 hover:bg-[#a40202] hover:text-white hover:shadow-[0_6px_20px_rgba(164,2,2,0.4)] hover:scale-105 no-underline inline-block cursor-pointer tracking-wider max-md:w-full max-md:text-center"
            >
              Leer Blog
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

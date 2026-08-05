import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Cookie, FileText, Mail, Trash2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Privacidad - Punk Medallo",
  description:
    "Política de privacidad de Punk Medallo: qué datos recopilamos, uso de cookies, publicidad de terceros (Google AdSense), derechos del usuario y procedimiento de retiro de contenido.",
  alternates: {
    canonical: "/politica-de-privacidad",
  },
  openGraph: {
    title: "Política de Privacidad - Punk Medallo",
    description:
      "Conoce cómo Punk Medallo maneja tus datos, las cookies y la publicidad de terceros.",
    url: "/politica-de-privacidad",
    type: "website",
    locale: "es_CO",
    siteName: "Punk Medallo",
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

const sections = [
  {
    icon: FileText,
    title: "1. ¿Quiénes somos?",
    body: (
      <>
        Punk Medallo es una plataforma de la escena punk de Medellín dedicada a
        la transmisión de música en línea (radio 24/7), el archivo de álbumes
        de bandas independientes, la venta de merchandising y la difusión de la
        cultura punk, hardcore y alternativa. Nuestro sitio web es{" "}
        <strong>https://punkmedallo.com</strong>.
      </>
    ),
  },
  {
    icon: ShieldCheck,
    title: "2. Datos que recopilamos",
    body: (
      <>
        <strong>Información que nos proporcionas:</strong> cuando usas nuestro
        formulario de contacto o creas una cuenta en la tienda, recopilamos los
        datos que envías voluntariamente (nombre, correo electrónico, mensaje,
        dirección de envío cuando realizas una compra).
        <br />
        <br />
        <strong>Información técnica:</strong> podemos recopilar de forma
        automática datos como tu dirección IP, tipo de navegador, dispositivo,
        páginas visitadas y duración de la visita, con fines de seguridad,
        análisis y mejora del servicio.
      </>
    ),
  },
  {
    icon: Cookie,
    title: "3. Cookies y tecnologías similares",
    body: (
      <>
        Este sitio utiliza cookies y tecnologías similares (incluyendo
        beacons/web beacons y direcciones IP) para el funcionamiento del sitio,
        el análisis de visitas y la publicidad.
        <br />
        <br />
        <strong>Cookies propias:</strong> utilizadas para el funcionamiento de
        la tienda (carrito, sesión de usuario) y las preferencias del sitio.
        <br />
        <br />
        <strong>Cookies de terceros:</strong> terceros, incluido Google, pueden
        colocar y leer cookies en tu navegador, o usar web beacons o
        direcciones IP, como resultado de la publicación de anuncios en
        nuestro sitio. Esto nos permite, por ejemplo, mostrar anuncios
        personalizados según tu historial de navegación.
        <br />
        <br />
        Para obtener más información sobre cómo utiliza Google los datos
        cuando usas sitios o aplicaciones de sus socios, visita:{" "}
        <a
          href="https://www.google.com/policies/privacy/partners/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#dc2626] underline underline-offset-2"
        >
          Cómo usa Google los datos cuando usas sitios o aplicaciones de
          nuestros socios
        </a>
        .
        <br />
        <br />
        Puedes configurar tu navegador para bloquear o eliminar las cookies, y
        desactivar los anuncios personalizados en la página de{" "}
        <a
          href="https://adssettings.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#dc2626] underline underline-offset-2"
        >
          Configuración de anuncios de Google
        </a>
        .
      </>
    ),
  },
  {
    icon: FileText,
    title: "4. Publicidad de terceros (Google AdSense)",
    body: (
      <>
        Cuando nuestro sitio muestre anuncios de Google AdSense, Google y sus
        socios pueden utilizar cookies para servir anuncios basados en tus
        visitas anteriores a este y a otros sitios web. Puedes optar por no
        recibir publicidad personalizada visitando la página de{" "}
        <a
          href="https://adssettings.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#dc2626] underline underline-offset-2"
        >
          Configuración de anuncios de Google
        </a>{" "}
        o la página{" "}
        <a
          href="https://www.aboutads.info"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#dc2626] underline underline-offset-2"
        >
          www.aboutads.info
        </a>
        .
      </>
    ),
  },
  {
    icon: ShieldCheck,
    title: "5. Análisis de visitas",
    body: (
      <>
        Utilizamos herramientas de análisis de terceros (como Google
        Analytics) que pueden recopilar información anónima sobre el uso del
        sitio (páginas visitadas, origen del tráfico, dispositivo). Estos datos
        se usan exclusivamente para entender y mejorar la experiencia de
        nuestros visitantes.
      </>
    ),
  },
  {
    icon: Trash2,
    title: "6. Retiro de contenido (Derechos de autor)",
    body: (
      <>
        Punk Medallo apoya la escena punk independiente y promueve la
        distribución libre de material promocional de bandas underground. Si
        eres autor, banda, sello o titular de derechos sobre algún material
        publicado en este sitio y deseas que sea retirado, escríbenos a través
        de nuestra página de{" "}
        <Link href="/contacto" className="text-[#dc2626] underline underline-offset-2">
          contacto
        </Link>{" "}
        con el enlace del contenido y lo retiraremos a la mayor brevedad
        posible.
      </>
    ),
  },
  {
    icon: Mail,
    title: "7. Tus derechos",
    body: (
      <>
        Tienes derecho a solicitar acceso, corrección o eliminación de los
        datos personales que nos hayas proporcionado. Para ejercer estos
        derechos, contáctanos a través de la página de{" "}
        <Link href="/contacto" className="text-[#dc2626] underline underline-offset-2">
          contacto
        </Link>
        .
      </>
    ),
  },
  {
    icon: FileText,
    title: "8. Cambios en esta política",
    body: (
      <>
        Podemos actualizar esta política de privacidad periódicamente. Los
        cambios se publicarán en esta página con su fecha de actualización.
        Te recomendamos revisarla de vez en cuando.
      </>
    ),
  },
];

export default function PoliticaDePrivacidad() {
  return (
    <main className="mx-auto max-w-3xl px-4 pt-28 pb-16 text-[#e0e0e0]">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-[#dc2626]">
        Legal
      </p>
      <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">
        Política de Privacidad
      </h1>
      <p className="mt-3 font-mono text-xs text-neutral-500">
        Última actualización: agosto de 2026
      </p>

      <div className="mt-10 flex flex-col gap-8">
        {sections.map((section) => (
          <section
            key={section.title}
            className="rounded-lg border border-neutral-800 bg-[rgba(52,58,64,0.25)] p-6"
          >
            <h2 className="flex items-center gap-2.5 text-lg font-bold text-white">
              <section.icon size={18} className="text-[#dc2626]" aria-hidden="true" />
              {section.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-neutral-300">
              {section.body}
            </p>
          </section>
        ))}
      </div>

      <p className="mt-10 text-xs text-neutral-600">
        Preguntas sobre esta política: usa nuestra página de{" "}
        <Link href="/contacto" className="text-[#dc2626] underline underline-offset-2">
          contacto
        </Link>
        .
      </p>
    </main>
  );
}

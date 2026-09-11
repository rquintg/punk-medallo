import type { Metadata } from "next";
import Link from "next/link";
import { Cookie, Settings2, ShieldCheck, Clock, Mail, FileText } from "lucide-react";
import { ogImageActual } from "@/features/tienda/utils/seo";

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await ogImageActual();
  return {
    title: "Política de Cookies",
    description:
      "Política de cookies de Punk Medallo: qué son, tipos que usamos (necesarias, analítica, publicidad AdSense), duración, cómo configurar tu navegador y desactivar anuncios personalizados.",
    alternates: { canonical: "/politica-de-cookies" },
    openGraph: {
      title: "Política de Cookies - Punk Medallo",
      description: "Tipos de cookies, publicidad de terceros y cómo gestionarlas.",
      url: "/politica-de-cookies",
      type: "website",
      locale: "es_CO",
      siteName: "Punk Medallo",
      images: [{ url: ogImage, width: 1200, height: 630, type: "image/jpeg" }],
    },
  };
}

const sections = [
  {
    icon: Cookie,
    title: "1. ¿Qué son las cookies?",
    body: (
      <>
        Las cookies son pequeños archivos de texto que tu navegador almacena cuando visitas un sitio. También podemos usar tecnologías similares como
        almacenamiento local, web beacons o píxeles para recordar preferencias, mantener tu sesión y medir el uso del sitio.
      </>
    ),
  },
  {
    icon: Settings2,
    title: "2. Tipos de cookies que usamos",
    body: (
      <>
        <strong>Necesarias:</strong> imprescindibles para el funcionamiento (carrito, sesión de tienda, checkout de boletas <code>pm-boletas-checkout-v2</code>, preferencias de tienda_config y visibilidad). Sin ellas la tienda y la boletería no funcionan.
        <br />
        <br />
        <strong>Analítica:</strong> nos ayudan a entender el uso (páginas vistas, origen, dispositivo) vía Google Analytics y GA4 Data API en el admin. Datos agregados y anonimizados.
        <br />
        <br />
        <strong>Publicidad (Google AdSense):</strong> terceros, incluido Google, pueden colocar y leer cookies o usar web beacons / direcciones IP para mostrar anuncios personalizados según tus visitas a este y otros sitios.
      </>
    ),
  },
  {
    icon: Clock,
    title: "3. Duración y gestión",
    body: (
      <>
        Las cookies necesarias suelen ser de sesión o persistentes cortas (carrito y verificación de pedido <code>pm_orden_verify</code> 7 días). Las de analítica y publicidad
        dependen de Google y sus socios; puedes ver y borrar las cookies desde la configuración de tu navegador y gestionar el almacenamiento local.
      </>
    ),
  },
  {
    icon: ShieldCheck,
    title: "4. Cómo gestionar o desactivar cookies",
    body: (
      <>
        Puedes configurar tu navegador para bloquear o eliminar cookies, y desactivar anuncios personalizados en:
        <br />
        <br />
        <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
          Configuración de anuncios de Google
        </a>{" "}
        y{" "}
        <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
          www.aboutads.info
        </a>
        . Para más información sobre cómo usa Google los datos:
        <br />
        <br />
        <a href="https://www.google.com/policies/privacy/partners/" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
          Cómo usa Google los datos cuando usas sitios o aplicaciones de nuestros socios
        </a>
        .
      </>
    ),
  },
  {
    icon: Mail,
    title: "5. Contacto",
    body: (
      <>
        Dudas sobre cookies: escríbenos a <a href="mailto:info@punkmedallo.com" className="text-primary underline underline-offset-2">info@punkmedallo.com</a> o usa nuestra página de{" "}
        <Link href="/contacto" className="text-primary underline underline-offset-2">contacto</Link>.
      </>
    ),
  },
  {
    icon: FileText,
    title: "6. Cambios en esta política",
    body: <>Podemos actualizar esta política periódicamente. Los cambios se publican aquí con fecha de actualización.</>,
  },
];

export default function PoliticaDeCookies() {
  return (
    <main className="mx-auto max-w-3xl px-4 pt-28 pb-16 text-muted-foreground">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-primary">Legal</p>
      <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">Política de Cookies</h1>
      <p className="mt-3 font-mono text-xs text-neutral-500">Última actualización: septiembre de 2026</p>
      <div className="mt-10 flex flex-col gap-8">
        {sections.map((section) => (
          <section key={section.title} className="rounded-lg border border-neutral-800 bg-muted/25 p-6">
            <h2 className="flex items-center gap-2.5 text-lg font-bold text-white">
              <section.icon size={18} className="text-primary" aria-hidden="true" />
              {section.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-neutral-300">{section.body}</p>
          </section>
        ))}
      </div>
      <p className="mt-10 text-xs text-neutral-600">
        Consulta también nuestra <Link href="/politica-de-privacidad" className="text-primary underline underline-offset-2">política de privacidad</Link> y <Link href="/terminos" className="text-primary underline underline-offset-2">términos</Link>.
      </p>
    </main>
  );
}

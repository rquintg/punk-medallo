import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ShieldCheck, Scale, Copyright, Mail, AlertTriangle } from "lucide-react";
import { ogImageActual } from "@/features/tienda/utils/seo";

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await ogImageActual();
  return {
    title: "Términos y Aviso Legal",
    description:
      "Términos y aviso legal de Punk Medallo: titular, condiciones de uso, propiedad intelectual, descargas promocionales de bandas underground, enlaces externos y limitación de responsabilidad.",
    alternates: { canonical: "/terminos" },
    openGraph: {
      title: "Términos y Aviso Legal - Punk Medallo",
      description: "Condiciones de uso, propiedad intelectual y aviso legal.",
      url: "/terminos",
      type: "website",
      locale: "es_CO",
      siteName: "Punk Medallo",
      images: [{ url: ogImage, width: 1200, height: 630, type: "image/jpeg" }],
    },
  };
}

const sections = [
  {
    icon: FileText,
    title: "1. Titular y contacto",
    body: (
      <>
        <strong>Punk Medallo</strong> — Archivo vivo del punk de Medellín. Radio 24/7, descargas, fotos, toques, tienda y boletería.
        <br />
        <br />
        Sitio: <strong>https://punkmedallo.com</strong>
        <br />
        Contacto: <a href="mailto:info@punkmedallo.com" className="text-primary underline underline-offset-2">info@punkmedallo.com</a> · Medellín, Colombia · También vía{" "}
        <Link href="/contacto" className="text-primary underline underline-offset-2">formulario de contacto</Link>.
      </>
    ),
  },
  {
    icon: ShieldCheck,
    title: "2. Condiciones de uso",
    body: (
      <>
        Al acceder y usar este sitio aceptas estas condiciones. Te comprometes a usarlo de forma lícita, sin intentar vulnerar su seguridad,
        sin extraer datos de forma masiva y respetando a la comunidad.
      </>
    ),
  },
  {
    icon: Scale,
    title: "3. Tienda y boletería",
    body: (
      <>
        Las compras de merch y boletas se rigen por sus políticas específicas: <Link href="/politica-de-cambios" className="text-primary underline underline-offset-2">política de cambios</Link> (solo talla, 7 días) y{" "}
        <Link href="/terminos-boleteria" className="text-primary underline underline-offset-2">términos de boletería</Link> (boletas nominativas PM-TKT, límite 4 por persona y evento, no reembolsables salvo cancelación). Los precios, stock y disponibilidad pueden variar sin previo aviso.
      </>
    ),
  },
  {
    icon: Copyright,
    title: "4. Propiedad intelectual y descargas",
    body: (
      <>
        El sitio promueve material promocional de bandas punk independientes y underground. Si eres titular de derechos y deseas el retiro de algún contenido, escríbenos a{" "}
        <a href="mailto:info@punkmedallo.com" className="text-primary underline underline-offset-2">info@punkmedallo.com</a> o vía{" "}
        <Link href="/contacto" className="text-primary underline underline-offset-2">contacto</Link> con el enlace y lo retiraremos a la brevedad. El contenido propio (textos, diseño, marca Punk Medallo y fotografías del equipo) está protegido; no lo reproduzcas sin autorización.
      </>
    ),
  },
  {
    icon: AlertTriangle,
    title: "5. Enlaces externos y publicidad",
    body: (
      <>
        Podemos enlazar a sitios externos (bandcamp, soundcloud, youtube, tiendas de terceros) y mostrar publicidad de terceros (Google AdSense, con cookies y web beacons — ver{" "}
        <Link href="/politica-de-cookies" className="text-primary underline underline-offset-2">política de cookies</Link>). No controlamos esos sitios ni sus contenidos.
      </>
    ),
  },
  {
    icon: ShieldCheck,
    title: "6. Limitación de responsabilidad",
    body: (
      <>
        El servicio se ofrece “tal cual”. No garantizamos disponibilidad ininterrumpida de la radio, las descargas o la tienda. Eventos, fechas y lugares pueden variar por producción (ver <Link href="/boletas" className="text-primary underline underline-offset-2">boletas</Link>).
        En ningún caso seremos responsables por daños indirectos derivados del uso del sitio más allá de lo permitido por la ley aplicable en Colombia.
      </>
    ),
  },
  {
    icon: FileText,
    title: "7. Cambios en estos términos",
    body: <>Podemos actualizar estos términos periódicamente. Los cambios se publican aquí con fecha de actualización.</>,
  },
];

export default function Terminos() {
  return (
    <main className="mx-auto max-w-3xl px-4 pt-28 pb-16 text-muted-foreground">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-primary">Legal</p>
      <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">Términos y Aviso Legal</h1>
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
        Consulta también nuestra <Link href="/politica-de-privacidad" className="text-primary underline underline-offset-2">política de privacidad</Link>,{" "}
        <Link href="/politica-de-cookies" className="text-primary underline underline-offset-2">política de cookies</Link> y <Link href="/politica-de-cambios" className="text-primary underline underline-offset-2">política de cambios</Link>.
      </p>
    </main>
  );
}

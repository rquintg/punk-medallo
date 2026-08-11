import type { Metadata } from "next";
import Link from "next/link";
import { Shirt, Timer, Undo2, Truck, MessageSquare, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Cambios",
  description:
    "Política de cambios de Punk Medallo: cambio exclusivo por talla dentro de los 7 días posteriores a la entrega, prenda sin usar, sin daños ni modificaciones.",
  alternates: {
    canonical: "/politica-de-cambios",
  },
  openGraph: {
    title: "Política de Cambios - Punk Medallo",
    description:
      "Cambio exclusivo por talla en la tienda Punk Medallo: 7 días, prenda sin usar, sin daños ni modificaciones.",
    url: "/politica-de-cambios",
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
    icon: Shirt,
    title: "1. ¿Qué productos se pueden cambiar?",
    body: (
      <>
        En Punk Medallo ofrecemos <strong>cambio exclusivo por talla</strong>{" "}
        para prendas de vestir (camisetas y camisillas) compradas en nuestra
        tienda. No realizamos devolución de dinero bajo ninguna modalidad.
        Accesorios y demás productos no aplican cambio salvo error nuestro en
        el despacho.
        <br />
        <br />
        Para que el cambio proceda, la prenda debe estar{" "}
        <strong>sin usar, sin lavar, sin daños ni modificaciones</strong>{" "}
        realizadas por el comprador, y conservar sus etiquetas originales.
      </>
    ),
  },
  {
    icon: Timer,
    title: "2. Plazo para solicitar el cambio",
    body: (
      <>
        Tienes hasta <strong>7 días calendario desde la entrega</strong> del
        pedido para solicitar el cambio de talla. Pasado este plazo, no será
        posible realizar el cambio.
      </>
    ),
  },
  {
    icon: Truck,
    title: "3. ¿Quién asume el envío?",
    body: (
      <>
        El <strong>comprador asume el costo de envío de vuelta</strong> de la
        prenda original <strong>y el envío de la nueva talla</strong>. Una vez
        recibamos la prenda y verifiquemos que cumple las condiciones
        establecidas, despachamos la talla de cambio. Si la talla solicitada
        no tiene stock, se te ofrecerá otra talla o un producto de precio
        equivalente.
      </>
    ),
  },
  {
    icon: Undo2,
    title: "4. Procedimiento para solicitar el cambio",
    body: (
      <>
        Para solicitar un cambio, escríbenos a través de la página de{" "}
        <Link href="/contacto" className="text-[#dc2626] underline underline-offset-2">
          contacto
        </Link>{" "}
        indicando tu <strong>número de pedido</strong>, la{" "}
        <strong>talla original</strong> y la{" "}
        <strong>talla deseada</strong>. Te indicaremos los pasos a seguir y la
        dirección de recepción.
      </>
    ),
  },
  {
    icon: MessageSquare,
    title: "5. Casos especiales",
    body: (
      <>
        Si el producto llegó <strong>dañado</strong>, con la talla o el diseño
        equivocado por un error nuestro, la prenda se <strong>repone sin
        costo de envío</strong> para el comprador. Reporta cualquier
        inconveniente dentro de los 7 días posteriores a la entrega.
      </>
    ),
  },
  {
    icon: FileText,
    title: "6. Cambios en esta política",
    body: (
      <>
        Podemos actualizar esta política de cambios periódicamente. Los
        cambios se publicarán en esta página con su fecha de actualización.
        Recomendamos revisarla de vez en cuando.
      </>
    ),
  },
];

export default function PoliticaDeCambios() {
  return (
    <main className="mx-auto max-w-3xl px-4 pt-28 pb-16 text-[#e0e0e0]">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-[#dc2626]">
        Legal
      </p>
      <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">
        Política de Cambios
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
        Consulta también nuestra{" "}
        <Link href="/politica-de-privacidad" className="text-[#dc2626] underline underline-offset-2">
          política de privacidad
        </Link>
        . Preguntas sobre esta política: usa nuestra página de{" "}
        <Link href="/contacto" className="text-[#dc2626] underline underline-offset-2">
          contacto
        </Link>
        .
      </p>
    </main>
  );
}
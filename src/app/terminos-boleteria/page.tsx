import type { Metadata } from "next";
import Link from "next/link";
import { Ticket, ShieldCheck, Users, Ban, Mail, FileText, AlertTriangle } from "lucide-react";
import { ogImageActual } from "@/features/tienda/utils/seo";

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await ogImageActual();
  return {
    title: "Términos de Boletería",
    description:
      "Términos de boletería Punk Medallo: boletas nominativas con QR único, límite 4 por persona, no reembolsables, validación en puerta y reenvío.",
    alternates: { canonical: "/terminos-boleteria" },
    openGraph: {
      title: "Términos de Boletería - Punk Medallo",
      description: "Boletas nominativas, QR único, límite 4 y condiciones de ingreso.",
      url: "/terminos-boleteria",
      type: "website",
      locale: "es_CO",
      siteName: "Punk Medallo",
      images: [{ url: ogImage, width: 1200, height: 630, type: "image/jpeg" }],
    },
  };
}

const sections = [
  {
    icon: Ticket,
    title: "1. Naturaleza de la boleta",
    body: (
      <>
        Cada boleta es <strong>personal y nominativa</strong>, asociada a tu
        cuenta y a tu documento. Incluye un código único <strong>PM-TKT</strong>{" "}
        y un QR con firma HMAC que se valida una sola vez en puerta contra el
        servidor. Debes presentarla junto con tu documento. La captura o
        reenvío del QR no transfiere la titularidad.
      </>
    ),
  },
  {
    icon: Users,
    title: "2. Límite 4 por persona y evento",
    body: (
      <>
        Por control anti-reventa, cada usuario puede acumular máximo{" "}
        <strong>4 boletas por evento</strong> (sumando todos los tipos: General,
        VIP, etc.). El sistema valida el límite al agregar al checkout y al
        pagar. Intentos adicionales serán rechazados (409) y el cupo se libera
        automáticamente si el pago no se completa.
      </>
    ),
  },
  {
    icon: Ban,
    title: "3. No reembolsable",
    body: (
      <>
        Las boletas <strong>no son reembolsables</strong> salvo cancelación o
        reprogramación del evento por parte de la organización. En esos casos
        informaremos el procedimiento por el correo de compra. No se realizan
        cambios de titularidad ni devoluciones por arrepentimiento.
      </>
    ),
  },
  {
    icon: Mail,
    title: "4. Entrega y reenvío",
    body: (
      <>
        Tras el pago aprobado por Wompi recibirás un correo con el QR y el
        detalle en <Link href="/cuenta/boletas" className="text-[#dc2626] underline underline-offset-2">Mis boletas</Link>. Si no lo ves, reenvíalo
        desde esa sección (rate-limit). Conserva el correo; el QR también
        queda disponible en tu cuenta.
      </>
    ),
  },
  {
    icon: ShieldCheck,
    title: "5. Validación en puerta",
    body: (
      <>
        En puerta se escanea el QR. Estados: <strong>Válida</strong> → se marca
        como usada y se permite el ingreso; <strong>Usada</strong> → ya ingresó
        (se muestra fecha de primer escaneo); <strong>Anulada</strong> → pedido
        anulado/rechazado. Cada evento valida solo sus boletas; un QR de otro
        evento no abre puerta y no se marca como usado.
      </>
    ),
  },
  {
    icon: AlertTriangle,
    title: "6. Modificaciones del evento",
    body: (
      <>
        Fecha, lugar y horarios pueden variar por motivos de producción. Los
        cambios se comunican por el correo de compra y en{" "}
        <Link href="/boletas" className="text-[#dc2626] underline underline-offset-2">/boletas</Link>. Dudas:{" "}
        <Link href="/contacto" className="text-[#dc2626] underline underline-offset-2">contacto</Link>.
      </>
    ),
  },
  {
    icon: FileText,
    title: "7. Cambios en estos términos",
    body: (
      <>
        Podemos actualizar estos términos periódicamente. Los cambios se
        publicarán en esta página con su fecha de actualización.
      </>
    ),
  },
];

export default function TerminosBoleteria() {
  return (
    <main className="mx-auto max-w-3xl px-4 pt-28 pb-16 text-[#e0e0e0]">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-[#dc2626]">Legal</p>
      <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">Términos de Boletería</h1>
      <p className="mt-3 font-mono text-xs text-neutral-500">Última actualización: septiembre de 2026</p>

      <div className="mt-10 flex flex-col gap-8">
        {sections.map((section) => (
          <section key={section.title} className="rounded-lg border border-neutral-800 bg-[rgba(52,58,64,0.25)] p-6">
            <h2 className="flex items-center gap-2.5 text-lg font-bold text-white">
              <section.icon size={18} className="text-[#dc2626]" aria-hidden="true" />
              {section.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-neutral-300">{section.body}</p>
          </section>
        ))}
      </div>

      <p className="mt-10 text-xs text-neutral-600">
        Consulta también nuestra{" "}
        <Link href="/politica-de-privacidad" className="text-[#dc2626] underline underline-offset-2">política de privacidad</Link> y{" "}
        <Link href="/politica-de-cambios" className="text-[#dc2626] underline underline-offset-2">política de cambios</Link>. Preguntas:{" "}
        <Link href="/contacto" className="text-[#dc2626] underline underline-offset-2">contacto</Link>.
      </p>
    </main>
  );
}

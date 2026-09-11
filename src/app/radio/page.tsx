import type { Metadata } from "next";
import Image from "next/image";
import RadioClient from "./radio-client";
import { ogImageActual } from "@/features/tienda/utils/seo";
import { getTiendaConfig, LOGO_DEFAULT } from "@/features/tienda/services/tienda-config";

export const revalidate = 30;

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await ogImageActual();
  return {
    title: "Radio — Punk Medallo 24/7",
    description: "Escucha la radio 24/7 de Punk Medallo: lo que suena ahora, lo que sonó hace poco y pide tu canción en vivo.",
    alternates: { canonical: "/radio" },
    openGraph: {
      title: "Radio — Punk Medallo 24/7",
      description: "Radio hardcore y punk sin pausa desde Medellín. Escucha, pide y revive.",
      url: "/radio",
      type: "website",
      locale: "es_CO",
      siteName: "Punk Medallo",
      images: [{ url: ogImage, width: 1200, height: 630, type: "image/jpeg" }],
    },
  };
}

export default async function RadioPage() {
  const { logoUrl } = await getTiendaConfig().catch(() => ({ logoUrl: null as string | null }));
  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-white/[0.06] bg-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-24 pb-10 md:pt-28 md:pb-12 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Punk Medallo — En vivo</p>
            <h1 className="mt-3 text-5xl font-black uppercase leading-none tracking-tight text-white md:text-7xl">
              Radio <span className="text-primary">24/7</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Puro punk, hardcore y alternativo sin pausa. Escucha lo que suena ahora, descubre lo que sonó hace poco y pide tu canción.
            </p>
          </div>
          <div className="relative aspect-[2/1] w-full max-w-[320px] shrink-0 self-center lg:self-auto">
            <Image src={logoUrl ?? LOGO_DEFAULT} alt="Punk Medallo" fill priority sizes="320px" className="object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]" />
          </div>
        </div>
      </section>

      <section className="w-screen ml-[calc(-50vw+50%)] bg-background">
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
          <RadioClient />
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BroadcastService",
            name: "Punk Medallo Radio",
            broadcastDisplayName: "Punk Medallo — Radio 24/7",
            url: "https://punkmedallo.com/radio",
            parentOrganization: { "@type": "Organization", name: "Punk Medallo", url: "https://punkmedallo.com" },
            potentialAction: { "@type": "ListenAction", target: "https://a3.asurahosting.com/listen/punk_medallo/radio.mp3" },
          }),
        }}
      />
    </div>
  );
}

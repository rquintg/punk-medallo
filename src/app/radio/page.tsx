import type { Metadata } from "next";
import RadioClient from "./radio-client";
import RadioHero from "@/components/radio/radio-hero";
import { ogImageActual } from "@/features/tienda/utils/seo";
import { getTiendaConfig } from "@/features/tienda/services/tienda-config";

export const revalidate = 86400;

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
      <RadioHero logoUrl={logoUrl} />

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

import type { Metadata } from "next";
import Image from "next/image";
import StaffComponent from "@/components/StaffComponent";
import RecentTrack from "@/components/RecentTrack";
import HomeSongButton from "./HomeSongButton";
import { getTiendaConfig, LOGO_DEFAULT } from "@/features/tienda/services/tienda-config";
import { ogImageActual } from "@/features/tienda/utils/seo";

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await ogImageActual();
  return {
    title: "Punk Medallo - Radio 24/7 de puro punk",
    description:
      "Lo más grotesco, viejo, perdido en el tiempo y nuevo del punk local en un solo lugar",
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: "Punk Medallo - Radio 24/7 de puro punk",
      description:
        "Lo más grotesco, viejo, perdido en el tiempo y nuevo del punk local en un solo lugar",
      url: "/",
      type: "website",
      locale: "es_CO",
      siteName: "Punk Medallo",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          type: "image/jpeg",
        },
      ],
    },
  };
}

export default async function Home() {
  const { logoUrl } = await getTiendaConfig();
  return (
    <>
      <section className="relative w-full overflow-hidden">
        <div
          className="relative z-0 flex items-start justify-center h-[44vh] w-screen text-white pt-[64px] mb-[39vh] max-md:mb-[41vh] xl:h-[58vh] xl:mb-[10vh] ml-[calc(-50vw+50%)] bg-cover bg-center bg-no-repeat before:absolute before:inset-0 before:bg-gradient-to-br before:from-black/50 before:to-black/60 before:z-[-1] before:pointer-events-none"
          style={{ backgroundImage: "url('/images/fondo.jpeg')" }}
        >
          <div className="flex flex-col items-center justify-center mx-auto p-4 w-full max-w-[600px]">
            <h1 className="sr-only">Punk Medallo</h1>
            <div className="relative mt-3 w-[90%] max-w-[450px] aspect-[2/1]">
              <Image
                src={logoUrl ?? LOGO_DEFAULT}
                alt="punk medallo"
                fill
                priority
                sizes="(max-width: 768px) 90vw, 450px"
                className="object-contain drop-shadow-[0_4px_6px_rgba(164,2,2,0.5)]"
              />
            </div>
            <HomeSongButton />
          </div>
        </div>

        <div className="absolute top-[40vh] max-md:top-[40vh] xl:top-[33vh] left-1/2 -translate-x-1/2">
          <RecentTrack />
        </div>
      </section>

      <StaffComponent />
    </>
  );
}

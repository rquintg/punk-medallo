import type { Metadata } from "next";
import Image from "next/image";
import StaffComponent from "@/components/StaffComponent";
import RecentTrack from "@/components/RecentTrack";
import HomeSongButton from "./HomeSongButton";

export const metadata: Metadata = {
  title: "Punk Medallo - Radio 24/7 de puro punk",
  description:
    "Lo más grotesco, viejo, perdido en el tiempo y nuevo del punk local en un solo lugar",
  openGraph: {
    title: "Punk Medallo - Radio 24/7 de puro punk",
    description:
      "Lo más grotesco, viejo, perdido en el tiempo y nuevo del punk local en un solo lugar",
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

export default function Home() {
  return (
    <>
      <section className="relative w-full overflow-hidden">
        <div
          className="relative z-0 flex items-start justify-center h-[44vh] w-screen text-white pt-[35px] mb-[39vh] max-md:mb-[41vh] xl:h-[58vh] xl:mb-[10vh] ml-[calc(-50vw+50%)] bg-cover bg-center bg-no-repeat before:absolute before:inset-0 before:bg-gradient-to-br before:from-black/50 before:to-black/60 before:z-[-1] before:pointer-events-none"
          style={{ backgroundImage: "url('/images/fondo.jpeg')" }}
        >
          <div className="flex flex-col items-center justify-center mx-auto p-4 w-full max-w-[600px]">
            <h1 className="sr-only">Punk Medallo</h1>
            <Image
              src="/images/Logo-Punk-Medallo-2024 Blanco.png"
              alt="punk medallo"
              width={450}
              height={160}
              className="w-[90%] h-auto max-w-[450px] drop-shadow-[0_4px_6px_rgba(164,2,2,0.5)]"
              priority
            />
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

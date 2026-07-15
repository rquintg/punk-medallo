import type { Metadata } from "next";
import EventosContent from "./EventosContent";
import { fetchInstagramPhotos } from "@/lib/axiosInstagram";
import type { InstagramPhoto } from "@/lib/axiosInstagram";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Próximos Toques - Punk Medallo",
  description:
    "Mantente actualizado con los próximos eventos y toques punk en Medellín. Síguenos en Punk Medallo",
  openGraph: {
    title: "Próximos Toques - Punk Medallo",
    description:
      "Mantente actualizado con los próximos eventos y toques punk en Medellín.",
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

export default async function Eventos() {
  let photos: InstagramPhoto[] = [];
  try {
    photos = await fetchInstagramPhotos();
  } catch (error) {
    console.error("Error fetching initial Instagram photos:", error);
  }

  return <EventosContent initialPhotos={photos} />;
}

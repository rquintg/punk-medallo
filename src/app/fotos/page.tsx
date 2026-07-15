import type { Metadata } from "next";
import FotosContent from "./FotosContent";
import { fetchFacebookPhotos } from "@/lib/axiosFacebook";
import type { FacebookPhoto } from "@/lib/axiosFacebook";

// Revalidate every 600 seconds (10 minutes)
export const revalidate = 600;
export const metadata: Metadata = {
  title: "Registro Fotográfico - Punk Medallo",
  description:
    "Galería de fotos y eventos de Punk Medallo. Revive los mejores momentos del punk en Medellín a través de nuestro registro fotográfico.",
  openGraph: {
    title: "Registro Fotográfico - Punk Medallo",
    description:
      "Galería de fotos y eventos de Punk Medallo.",
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

export default async function Fotos() {
  // Server-side fetch for initial render (keeps tokens server-only)
  let photos: FacebookPhoto[] = [];
  try {
    photos = await fetchFacebookPhotos();
  } catch (error) {
    // swallow error — FotosContent will handle empty state / errors on client
    console.error("Error fetching initial Facebook photos:", error);
  }

  return <FotosContent initialPhotos={photos} />;
}

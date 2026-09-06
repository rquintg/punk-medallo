import type { Metadata } from "next";
import { EditorClient } from "@/components/editor/EditorClient";

const SITE_URL = "https://punkmedallo.com";
const OG_IMAGE = `${SITE_URL}/logo_punk_medallo.jpg`;

export const metadata: Metadata = {
  title: "Editor MP3 Gratis — Edita Metadatos ID3 (Título, Artista, Álbum y Portada)",
  description:
    "Editor de metadatos MP3 gratuito, sin registro y 100% privado. Edita título, artista, álbum, año, género y portada de tus MP3. Edición por lotes con descarga individual o ZIP masivo. Todo se procesa en tu navegador.",
  keywords: [
    "editor mp3",
    "editar metadatos mp3",
    "editor ID3",
    "cambiar portada mp3",
    "editar tags mp3",
    "editor mp3 online gratis",
    "ID3v2",
    "punk medallo",
  ],
  alternates: { canonical: "/editor-mp3" },
  openGraph: {
    title: "Editor MP3 Gratis — Edita Metadatos ID3 | Punk Medallo",
    description:
      "Cambia título, artista, álbum, año, género y portada de tus MP3 gratis. Por lotes, privado y sin subir nada. Descarga individual o ZIP.",
    url: "/editor-mp3",
    siteName: "Punk Medallo",
    type: "website",
    locale: "es_CO",
    images: [
      {
        url: OG_IMAGE,
        width: 1080,
        height: 1080,
        alt: "Punk Medallo — Editor MP3",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Editor MP3 Gratis — Edita Metadatos ID3 | Punk Medallo",
    description:
      "Editor MP3 online gratis. Edita título, artista, álbum y portada por lotes. 100% en tu navegador.",
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Editor MP3 — Punk Medallo",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "COP" },
  description:
    "Editor gratuito de metadatos MP3 (ID3v2.3). Edita título, artista, álbum, año, género y portada. Edición por lotes, descarga individual o ZIP, 100% en el navegador sin subir archivos.",
  url: `${SITE_URL}/editor-mp3`,
  image: OG_IMAGE,
  author: { "@type": "Organization", name: "Punk Medallo", url: SITE_URL },
  featureList: [
    "Editar título, artista, álbum, año, género y comentario",
    "Cambiar portada (JPG/PNG/WebP)",
    "Edición por lotes",
    "Descarga individual o ZIP masivo",
    "100% client-side, privado",
  ],
  isAccessibleForFree: true,
  inLanguage: "es-CO",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Editor MP3", item: `${SITE_URL}/editor-mp3` },
  ],
};

export default function EditorMp3Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <EditorClient />
    </>
  );
}

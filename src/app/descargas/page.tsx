import type { Metadata } from "next";
import DescargasContent from "./DescargasContent";
import { getBlogInfo } from "@/features/descargas/services/blogger";
import {
  getAlbumsPage,
  getArchiveYears,
} from "@/features/descargas/services/albums";
import { getArchive } from "@/features/descargas/services/archivo";
import { albumUrl } from "@/features/descargas/utils/seo";
import type { Album, BandInfo } from "@/features/descargas/types";

export const revalidate = 600;

const PAGE_URL = "https://punkmedallo.com/descargas";
const OG_IMAGE = {
  url: "https://punkmedallo.com/logo_punk_medallo.jpg",
  width: 1200,
  height: 630,
  type: "image/jpeg",
} as const;

export const metadata: Metadata = {
  title: "El Blog - Punk Medallo",
  description:
    "Archivo del punk de Medellín: más de 250 lanzamientos de bandas underground, descarga directa.",
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "El Blog - Punk Medallo",
    description:
      "Archivo del punk de Medellín: más de 250 lanzamientos de bandas underground, descarga directa.",
    url: PAGE_URL,
    type: "website",
    siteName: "Punk Medallo",
    locale: "es_CO",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "El Blog - Punk Medallo",
    description:
      "Archivo del punk de Medellín: más de 250 lanzamientos de bandas underground, descarga directa.",
    images: [OG_IMAGE.url],
  },
};

export default async function Descargas() {
  let albums: Album[] = [];
  let nextPageToken: string | null = null;
  let totalItems = 0;
  let totalBands = 0;
  let bands: BandInfo[] = [];
  let latestPublished: string | null = null;
  let years: string[] = [];

  try {
    const [blogInfo, page, archive, archiveYears] = await Promise.all([
      getBlogInfo(),
      getAlbumsPage({}),
      getArchive(),
      getArchiveYears(),
    ]);
    albums = page.albums;
    nextPageToken = page.nextPageToken;
    totalItems = archive.totalPosts || blogInfo.totalPosts;
    totalBands = archive.bands.length;
    bands = archive.bands;
    latestPublished = page.albums[0]?.published ?? null;
    years = archiveYears;
  } catch (error) {
    console.error("Error fetching blog posts:", error);
  }

  return (
    <>
      {albums.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: "Archivo del punk de Medellín",
              numberOfItems: totalItems,
              itemListElement: albums.map((album, index) => ({
                "@type": "ListItem",
                position: index + 1,
                url: albumUrl(album.slug),
                name: `${album.band} — ${album.title}`,
              })),
            }),
          }}
        />
      )}
      <DescargasContent
        initialAlbums={albums}
        initialNextPageToken={nextPageToken}
        totalItems={totalItems}
        totalBands={totalBands}
        bands={bands}
        latestPublished={latestPublished}
        years={years}
      />
    </>
  );
}

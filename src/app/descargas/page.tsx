import type { Metadata } from "next";
import DescargasContent from "./DescargasContent";
import { getBlogInfo } from "@/features/descargas/services/blogger";
import {
  getAlbumsPage,
  getArchiveYears,
} from "@/features/descargas/services/albums";
import { getArchive } from "@/features/descargas/services/archivo";
import type { Album, BandInfo } from "@/features/descargas/types";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "El Blog - Punk Medallo",
  description:
    "Archivo del punk de Medellín: más de 250 lanzamientos de bandas underground, descarga directa.",
  openGraph: {
    title: "El Blog - Punk Medallo",
    description:
      "Archivo del punk de Medellín: más de 250 lanzamientos de bandas underground, descarga directa.",
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
    <DescargasContent
      initialAlbums={albums}
      initialNextPageToken={nextPageToken}
      totalItems={totalItems}
      totalBands={totalBands}
      bands={bands}
      latestPublished={latestPublished}
      years={years}
    />
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlbumDetail } from "@/components/descargas/album-detail";
import {
  getAlbumBySlug,
  getRelatedAlbums,
} from "@/features/descargas/services/albums";
import {
  albumDescription,
  albumSchema,
  albumTitle,
} from "@/features/descargas/utils/seo";

export const revalidate = 600;

interface AlbumPageProps {
  params: Promise<{ slug: string }>;
}

const FALLBACK_IMAGE = {
  url: "https://punkmedallo.com/logo_punk_medallo.jpg",
  width: 1200,
  height: 630,
  type: "image/jpeg",
} as const;

export async function generateMetadata({
  params,
}: AlbumPageProps): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) {
    return {
      title: "Lanzamiento no encontrado - Punk Medallo",
    };
  }
  const title = albumTitle(album);
  return {
    title,
    description: albumDescription(album),
    openGraph: {
      title,
      description: albumDescription(album),
      type: "music.album",
      url: `https://punkmedallo.com/descargas/${album.slug}`,
      images: album.coverUrl
        ? [{ url: album.coverUrl, width: 1200, height: 1200 }]
        : [FALLBACK_IMAGE],
    },
    alternates: {
      canonical: album.postUrl,
    },
  };
}

export default async function AlbumPage({ params }: AlbumPageProps) {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) notFound();

  const related = await getRelatedAlbums(album.band, album.postId, 4);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(albumSchema(album)) }}
      />
      <AlbumDetail album={album} related={related} />
    </>
  );
}

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
  albumUrl,
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
  const url = albumUrl(album.slug);
  return {
    title,
    description: albumDescription(album),
    openGraph: {
      title,
      description: albumDescription(album),
      type: "music.album",
      url,
      siteName: "Punk Medallo",
      locale: "es_CO",
      images: album.coverUrl
        ? [{ url: album.coverUrl, width: 1200, height: 1200 }]
        : [FALLBACK_IMAGE],
    },
    alternates: {
      canonical: url,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: albumDescription(album),
      images: album.coverUrl ? [album.coverUrl] : [FALLBACK_IMAGE.url],
    },
  };
}

export default async function AlbumPage({ params }: AlbumPageProps) {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) notFound();

  const related = await getRelatedAlbums(album, 16);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: "https://punkmedallo.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "El Blog",
        item: "https://punkmedallo.com/descargas",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${album.band} — ${album.title}`,
        item: albumUrl(album.slug),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(albumSchema(album)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <AlbumDetail album={album} related={related} />
    </>
  );
}

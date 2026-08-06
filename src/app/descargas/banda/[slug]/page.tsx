import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { AlbumGrid } from "@/components/descargas/album-grid";
import { AlbumCard } from "@/components/descargas/album-card";
import {
  getAlbumsByBand,
} from "@/features/descargas/services/albums";
import { getArchive } from "@/features/descargas/services/archivo";
import { bandSlug } from "@/features/descargas/utils/album";

export const revalidate = 600;

interface BandPageProps {
  params: Promise<{ slug: string }>;
}

const PAGE_BASE = "https://punkmedallo.com/descargas/banda";

function resolveBandName(
  bands: Array<{ name: string }>,
  slug: string
): string | null {
  return bands.find((band) => bandSlug(band.name) === slug)?.name ?? null;
}

export async function generateMetadata({
  params,
}: BandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const archive = await getArchive();
  const name = resolveBandName(archive.bands, slug);
  if (!name) {
    return {
      title: "Banda no encontrada - Punk Medallo",
    };
  }
  const title = `${name} — Discografía`;
  const description = `Discografía de ${name} en el archivo del punk de Medellín: álbumes, demos y recopilaciones con descarga directa.`;
  const url = `${PAGE_BASE}/${slug}`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "Punk Medallo",
      locale: "es_CO",
    },
  };
}

export default async function BandPage({ params }: BandPageProps) {
  const { slug } = await params;
  const archive = await getArchive();
  const name = resolveBandName(archive.bands, slug);
  if (!name) notFound();

  const albums = await getAlbumsByBand(name);
  if (albums.length === 0) notFound();

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Discografía de ${name}`,
    description: `Discografía de ${name} en el archivo del punk de Medellín.`,
    url: `${PAGE_BASE}/${slug}`,
    isPartOf: {
      "@type": "WebSite",
      name: "Punk Medallo",
      url: "https://punkmedallo.com/",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <main className="mx-auto max-w-6xl px-4 pt-24 pb-10">
        <nav aria-label="Migajas de pan" className="mb-8">
          <Link
            href="/descargas"
            className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-neutral-500 transition-colors hover:text-[#dc2626]"
          >
            <ArrowLeft size={13} aria-hidden="true" />
            El Archivo
          </Link>
        </nav>

        <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-[#dc2626]">
          Banda
        </p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-white md:text-5xl">
          {name}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-400">
          Discografía de {name} en el archivo sonoro del punk de Medellín:{" "}
          {albums.length}{" "}
          {albums.length === 1 ? "lanzamiento" : "lanzamientos"} con descarga
          directa.
        </p>

        <div className="mt-8">
          <AlbumGrid>
            {albums.map((album, index) => (
              <AlbumCard key={album.slug} album={album} position={index + 1} />
            ))}
          </AlbumGrid>
        </div>
      </main>
    </>
  );
}

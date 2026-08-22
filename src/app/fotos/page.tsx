import type { Metadata } from "next";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import FotosContent from "./FotosContent";
import {
  fetchFacebookArchivoStats,
  fetchFacebookPagePhotos,
  fetchFacebookPageTop,
  fetchFacebookPageVideos,
} from "@/lib/axiosFacebook";
import type { StatsArchivo } from "@/lib/axiosFacebook";
import type {
  FotoFacebook,
  ItemFotos,
  PaginaFotos,
} from "@/features/fotos/types";
import { srcMasCercana } from "@/features/fotos/types";
import { ogImageActual } from "@/features/tienda/utils/seo";

export const revalidate = 600;

const SITE_URL = "https://punkmedallo.com";

// Las estadísticas exactas del archivo (conteos + rango de años) requieren un
// recorrido costoso de la Graph API (~15 llamadas: conteo fotos, probes
// since/until y walk de videos fragmentado por año). Se cachean 24h aparte de
// la revalidación de la página para no pagarlos cada 10 minutos. En dev no
// hay caché y bloquearía cada visita (~15-30s), así que se salta y se
// muestra el fallback derivado.
const getStatsArchivo = unstable_cache(
  async (): Promise<StatsArchivo | null> => {
    if (process.env.NODE_ENV === "development") return null;
    try {
      return await fetchFacebookArchivoStats();
    } catch (error) {
      console.error("Error computing fotos archive stats:", error);
      return null;
    }
  },
  ["fotos-archivo-stats"],
  { revalidate: 86_400 }
);

interface PaginasIniciales {
  fotos: {
    items: FotoFacebook[];
    next: string | null;
  };
  videos: PaginaFotos;
  top: ItemFotos[];
  stats: StatsArchivo | null;
}

// `cache()` de React: deduplica esta llamada dentro del mismo request
// (generateMetadata + render de la página la invocan 2 veces; en dev cada
// visita pagaría el doble de requests de la Graph API).
const obtenerPaginas = cache(async (): Promise<PaginasIniciales> => {
  // En dev no hay caché: el top (hasta 6 requests secuenciales) y las stats
  // (walk completo) bloquearían cada visita ~15-30s. Se saltan y el cliente
  // los carga por su cuenta (useFotosTop con skeleton + fallback derivado).
  if (process.env.NODE_ENV === "development") {
    try {
      const [fotoRes, videoRes] = await Promise.allSettled([
        fetchFacebookPagePhotos({ limit: 24 }),
        fetchFacebookPageVideos({ limit: 24 }),
      ]);
      return {
        fotos:
          fotoRes.status === "fulfilled"
            ? { items: fotoRes.value.fotos, next: fotoRes.value.next }
            : { items: [], next: null },
        videos:
          videoRes.status === "fulfilled"
            ? { items: videoRes.value.videos, next: videoRes.value.next }
            : { items: [], next: null },
        top: [],
        stats: null,
      };
    } catch (error) {
      console.error("Error fetching initial Facebook media:", error);
      return {
        fotos: { items: [], next: null },
        videos: { items: [], next: null },
        top: [],
        stats: null,
      };
    }
  }

  try {
    const [fotoRes, videoRes, topRes, statsRes] = await Promise.allSettled([
      fetchFacebookPagePhotos({ limit: 24 }),
      fetchFacebookPageVideos({ limit: 24 }),
      fetchFacebookPageTop({ limit: 6, maxPaginas: 3 }),
      getStatsArchivo(),
    ]);

    return {
      fotos:
        fotoRes.status === "fulfilled"
          ? { items: fotoRes.value.fotos, next: fotoRes.value.next }
          : { items: [], next: null },
      videos:
        videoRes.status === "fulfilled"
          ? { items: videoRes.value.videos, next: videoRes.value.next }
          : { items: [], next: null },
      top: topRes.status === "fulfilled" ? topRes.value : [],
      stats: statsRes.status === "fulfilled" ? statsRes.value : null,
    };
  } catch (error) {
    console.error("Error fetching initial Facebook media:", error);
    return {
      fotos: { items: [], next: null },
      videos: { items: [], next: null },
      top: [],
      stats: null,
    };
  }
});

function captionExcerpt(foto: FotoFacebook, max: number): string {
  const texto = (foto.name ?? "").replace(/\s+/g, " ").trim();
  if (!texto) return "Registro fotográfico de la escena punk de Medellín";
  return texto.length > max ? `${texto.slice(0, max).trim()}…` : texto;
}

export async function generateMetadata(): Promise<Metadata> {
  const [{ fotos }, logoOg] = await Promise.all([obtenerPaginas(), ogImageActual()]);
  const masReciente: FotoFacebook | undefined = fotos.items[0];

  const ogImage = masReciente
    ? { url: srcMasCercana(masReciente, 1200), type: "image/jpeg" }
    : { url: logoOg, width: 1200, height: 630, type: "image/jpeg" };

  return {
    title: "Registro Fotográfico",
    description:
      "La memoria visual de la escena punk de Medellín: fotos y videos de toques, bandas y barricadas, directo del archivo de Facebook de Punk Medallo.",
    alternates: {
      canonical: "/fotos",
    },
    openGraph: {
      title: masReciente
        ? `Registro Fotográfico — ${captionExcerpt(masReciente, 60)}`
        : "Registro Fotográfico - Punk Medallo",
      description: captionExcerpt(
        masReciente ?? ({ name: "" } as FotoFacebook),
        160
      ),
      url: "/fotos",
      type: "website",
      locale: "es_CO",
      siteName: "Punk Medallo",
      images: [ogImage],
    },
  };
}

export default async function Fotos() {
  const { fotos, videos, top, stats } = await obtenerPaginas();

  const gallerySchema = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: "Registro Fotográfico de Punk Medallo",
    description:
      "Fotos y videos de la escena punk de Medellín: toques, bandas y barricadas del archivo visual de Punk Medallo.",
    url: `${SITE_URL}/fotos`,
    image: fotos.items
      .slice(0, 12)
      .map((f: FotoFacebook) => ({
        "@type": "ImageObject",
        url: srcMasCercana(f, 800),
        ...(f.name ? { caption: f.name } : {}),
        ...(f.createdAt ? { datePublished: f.createdAt } : {}),
      })),
    author: { "@type": "Organization", name: "Punk Medallo", url: SITE_URL },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gallerySchema) }}
      />
      <FotosContent
        initialFotos={fotos}
        initialVideos={videos}
        initialTop={top}
        initialStats={stats}
      />
    </>
  );
}
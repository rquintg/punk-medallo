import type { Metadata } from "next";
import HeroCarousel from "@/components/home/hero-carousel";
import FotosMarquee from "@/components/home/fotos-marquee";
import ProductosHome from "@/components/home/productos-home";
import ProximosToques from "@/components/home/proximos-toques";
import BoleteriaHome from "@/components/home/boleteria-home";
import LiveStream from "@/components/LiveStream";
import { toEmbedUrl } from "@/lib/live-embed";
import { getTiendaConfig } from "@/features/tienda/services/tienda-config";
import { ogImageActual } from "@/features/tienda/utils/seo";
import { getProductosMasPedidos } from "@/features/tienda/services/products";
import type { Producto } from "@/features/tienda/types";
import type { EventoBoleto } from "@/features/boletas/types";
import { unstable_cache } from "next/cache";
import { fetchInstagramPhotos } from "@/lib/axiosInstagram";
import { parseCaptionEventos, esProximoEvento } from "@/features/eventos/parse-caption";
import { fetchFacebookPagePhotos } from "@/lib/axiosFacebook";
import { srcMasCercana, interaccion, formatInteraccion } from "@/features/fotos/types";
import { Suspense } from "react";
import { DestacadosHero } from "@/components/descargas/destacados-hero";
import { getAlbumBySlug } from "@/features/descargas/services/albums";
import { ProximosSkeleton, ArchivoSkeleton, DestacadosSkeleton, HeroSkeleton } from "@/components/home/skeletons";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await ogImageActual();
  return {
    title: "Punk Medallo - Radio 24/7 de puro punk",
    description: "Lo más grotesco, viejo, perdido en el tiempo y nuevo del punk local en un solo lugar",
    alternates: { canonical: "/" },
    openGraph: {
      title: "Punk Medallo - Radio 24/7 de puro punk",
      description: "Lo más grotesco, viejo, perdido en el tiempo y nuevo del punk local en un solo lugar",
      url: "/",
      type: "website",
      locale: "es_CO",
      siteName: "Punk Medallo",
      images: [{ url: ogImage, width: 1200, height: 630, type: "image/jpeg" }],
    },
  };
}

async function obtenerEventosHomeBase(): Promise<ReturnType<typeof parseCaptionEventos>> {
  const photos = await fetchInstagramPhotos();
  const eventos = parseCaptionEventos(photos);
  return eventos.filter((e) => esProximoEvento(e)).sort((a, b) => (a.fecha ?? "").localeCompare(b.fecha ?? "")).slice(0, 4);
}

const obtenerEventosHome = unstable_cache(async () => {
  try {
    return await obtenerEventosHomeBase();
  } catch (e) {
    console.error("Home eventos error:", e);
    return [];
  }
}, ["home-eventos"], { revalidate: 600 });

async function obtenerArchivoVisualBase() {
  const { fotos } = await fetchFacebookPagePhotos({ limit: 50 });
  const top = [...fotos]
    .filter((f) => f.srcs.length > 0)
    .sort((a, b) => interaccion(b) - interaccion(a))
    .slice(0, 12);
  return top.map((f) => ({
    id: f.id,
    src: srcMasCercana(f, 600),
    link: f.link,
    band: `❤️ ${formatInteraccion(interaccion(f))}`,
    title: f.name
      ? f.name.slice(0, 40)
      : f.createdAt
        ? new Date(f.createdAt).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric", timeZone: "America/Bogota" })
        : "Sin fecha",
  }));
}

const obtenerArchivoVisual = unstable_cache(async () => {
  try {
    return await obtenerArchivoVisualBase();
  } catch (e) {
    console.error("Home archivo visual error:", e);
    return [] as Array<{ id: string; src: string; link: string; band: string; title: string }>;
  }
}, ["home-archivo-visual"], { revalidate: 900 });

const DESTACADOS_SLUGS = [
  "recopilas",
  "los-restos",
  "nadie-discografia",
  "ixrxa-discografia-completa",
  "gp-discografia-completa",
  "los-suziox-discografia",
];

async function obtenerDestacadosBase() {
  const albums = await Promise.all(DESTACADOS_SLUGS.map((slug) => getAlbumBySlug(slug).catch(() => null)));
  return albums.filter((a): a is NonNullable<typeof a> => a !== null);
}

const obtenerDestacados = unstable_cache(async () => {
  try {
    return await obtenerDestacadosBase();
  } catch (e) {
    console.error("Home destacados error:", e);
    return [];
  }
}, ["home-destacados"], { revalidate: 3600 });



async function ProximosSection() {
  const eventos = await obtenerEventosHome();
  return <ProximosToques eventos={eventos} />;
}

async function ArchivoSection() {
  const fotos = await obtenerArchivoVisual();
  return <FotosMarquee fotos={fotos} />;
}

async function DestacadosSection() {
  const albums = await obtenerDestacados();
  return <DestacadosHero albums={albums} />;
}

async function ProductosSection({ tiendaActiva }: { tiendaActiva: boolean }) {
  if (!tiendaActiva) return null;
  const productos = await getProductosMasPedidos(4, 30).catch(() => [] as Producto[]);
  if (productos.length === 0) return null;
  return (
    <section className="w-screen ml-[calc(-50vw+50%)] bg-surface/20">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <ProductosHome productos={productos.slice(0, 4)} />
      </div>
    </section>
  );
}

async function BoleteriaSection({ boleteriaActiva }: { boleteriaActiva: boolean }) {
  if (!boleteriaActiva) return null;
  const { listarEventosActivos } = await import("@/features/boletas/services/public");
  const eventos = await listarEventosActivos().catch(() => [] as EventoBoleto[]);
  if (eventos.length === 0) return null;
  return (
    <section className="w-screen ml-[calc(-50vw+50%)] bg-background border-t border-white/[0.04]">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <BoleteriaHome eventos={eventos} />
      </div>
    </section>
  );
}

export default async function Home() {
  const { logoUrl, mostrarLive, liveUrl, liveTitulo, liveRevive, tiendaActiva, boleteriaActiva } = await getTiendaConfig();
  const liveEmbed = mostrarLive ? toEmbedUrl(liveUrl) : null;

  return (
    <>
      {liveEmbed && <LiveStream embedUrl={liveEmbed} titulo={liveTitulo} revive={liveRevive} />}
      <HeroCarousel logoUrl={logoUrl} />

      <section className="w-screen ml-[calc(-50vw+50%)] bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <h2 className="mb-6 text-lg font-black uppercase tracking-tight"><span className="text-white">Próximos</span> <span className="text-primary">toques</span></h2>
          <Suspense fallback={<ProximosSkeleton />}>
            <ProximosSection />
          </Suspense>
        </div>
      </section>

      <section className="w-screen ml-[calc(-50vw+50%)] bg-surface/40 border-y border-white/[0.04]">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <Suspense fallback={<DestacadosSkeleton />}>
            <DestacadosSection />
          </Suspense>
        </div>
      </section>

      <section className="w-screen ml-[calc(-50vw+50%)] bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <h2 className="mb-6 text-lg font-black uppercase tracking-tight"><span className="text-white">Archivo</span> <span className="text-primary">visual</span></h2>
          <Suspense fallback={<ArchivoSkeleton />}>
            <ArchivoSection />
          </Suspense>
        </div>
      </section>

      <Suspense fallback={null}>
        <ProductosSection tiendaActiva={tiendaActiva} />
      </Suspense>

      <Suspense fallback={null}>
        <BoleteriaSection boleteriaActiva={boleteriaActiva} />
      </Suspense>
    </>
  );
}

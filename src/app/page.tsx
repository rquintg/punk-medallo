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
import { fetchInstagramPhotos } from "@/lib/axiosInstagram";
import { parseCaptionEventos, esProximoEvento } from "@/features/eventos/parse-caption";
import { fetchFacebookPagePhotos } from "@/lib/axiosFacebook";
import { srcMasCercana, interaccion, formatInteraccion } from "@/features/fotos/types";
import { DestacadosHero } from "@/components/descargas/destacados-hero";
import { getAlbumBySlug } from "@/features/descargas/services/albums";

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

async function obtenerEventosHome() {
  try {
    const photos = await fetchInstagramPhotos();
    const eventos = parseCaptionEventos(photos);
    return eventos.filter((e) => esProximoEvento(e)).sort((a, b) => (a.fecha ?? "").localeCompare(b.fecha ?? "")).slice(0, 4);
  } catch (e) {
    console.error("Home eventos error:", e);
    return [];
  }
}

async function obtenerArchivoVisual() {
  try {
    const { fotos } = await fetchFacebookPagePhotos({ limit: 100 });
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
  } catch (e) {
    console.error("Home archivo visual error:", e);
    return [] as Array<{ id: string; src: string; link: string; band: string; title: string }>;
  }
}

const DESTACADOS_SLUGS = [
  "recopilas",
  "los-restos",
  "nadie-discografia",
  "ixrxa-discografia-completa",
  "gp-discografia-completa",
  "los-suziox-discografia",
];

async function obtenerDestacados() {
  try {
    const albums = await Promise.all(DESTACADOS_SLUGS.map((slug) => getAlbumBySlug(slug).catch(() => null)));
    return albums.filter((a): a is NonNullable<typeof a> => a !== null);
  } catch (e) {
    console.error("Home destacados error:", e);
    return [];
  }
}

export default async function Home() {
  const { logoUrl, mostrarLive, liveUrl, liveTitulo, liveRevive, tiendaActiva, boleteriaActiva } = await getTiendaConfig();
  const liveEmbed = mostrarLive ? toEmbedUrl(liveUrl) : null;

  const [productos, archivoVisual, eventosHome, destacados, boletasHome] = await Promise.all([
    tiendaActiva ? getProductosMasPedidos(4, 30).catch(() => [] as Producto[]) : Promise.resolve([] as Producto[]),
    obtenerArchivoVisual(),
    obtenerEventosHome(),
    obtenerDestacados(),
    boleteriaActiva ? import("@/features/boletas/services/public").then((m) => m.listarEventosActivos().catch(() => [] as EventoBoleto[])) : Promise.resolve([] as EventoBoleto[]),
  ]);

  return (
    <>
      {liveEmbed && <LiveStream embedUrl={liveEmbed} titulo={liveTitulo} revive={liveRevive} />}
      <HeroCarousel logoUrl={logoUrl} />

      <section className="w-screen ml-[calc(-50vw+50%)] bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <h2 className="mb-6 text-lg font-black uppercase tracking-tight"><span className="text-white">Próximos</span> <span className="text-primary">toques</span></h2>
          <ProximosToques eventos={eventosHome} />
        </div>
      </section>

      <section className="w-screen ml-[calc(-50vw+50%)] bg-surface/40 border-y border-white/[0.04]">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <DestacadosHero albums={destacados} />
        </div>
      </section>

      <section className="w-screen ml-[calc(-50vw+50%)] bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <h2 className="mb-6 text-lg font-black uppercase tracking-tight"><span className="text-white">Archivo</span> <span className="text-primary">visual</span></h2>
          <FotosMarquee fotos={archivoVisual} />
        </div>
      </section>

      {tiendaActiva && productos.length > 0 && (
        <section className="w-screen ml-[calc(-50vw+50%)] bg-surface/20">
          <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
            <ProductosHome productos={productos.slice(0, 4)} />
          </div>
        </section>
      )}

      {boleteriaActiva && boletasHome.length > 0 && (
        <section className="w-screen ml-[calc(-50vw+50%)] bg-background border-t border-white/[0.04]">
          <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
            <BoleteriaHome eventos={boletasHome} />
          </div>
        </section>
      )}
    </>
  );
}

import type { Metadata } from "next";
import EventosContent from "./EventosContent";
import { fetchInstagramPhotos } from "@/lib/axiosInstagram";
import { parseCaptionEventos, esProximoEvento } from "@/features/eventos/parse-caption";
import { formatearFecha, formatearPrecio } from "@/features/eventos/format";
import type { Evento } from "@/features/eventos/types";

export const revalidate = 600;

const SITE_URL = "https://punkmedallo.com";
const LOGO_OG = `${SITE_URL}/logo_punk_medallo.jpg`;

async function obtenerEventos(): Promise<Evento[]> {
  try {
    const photos = await fetchInstagramPhotos();
    return parseCaptionEventos(photos);
  } catch (error) {
    console.error("Error fetching initial Instagram photos:", error);
    return [];
  }
}

function proximos(eventos: Evento[]): Evento[] {
  return eventos
    .filter((e) => esProximoEvento(e))
    .sort((a, b) => (a.fecha ?? "").localeCompare(b.fecha ?? ""))
    .slice(0, 5);
}

function captionExcerpt(evento: Evento, max: number): string {
  const texto = (evento.caption ?? "").replace(/\s+/g, " ").trim();
  if (!texto) return `Toque de punk en ${evento.lugar ?? "Medellín"}`;
  return texto.length > max ? `${texto.slice(0, max).trim()}…` : texto;
}

export async function generateMetadata(): Promise<Metadata> {
  const eventos = await obtenerEventos();
  const siguiente = proximos(eventos)[0] ?? null;

  const ogTitle = siguiente
    ? `Próximo toque: ${siguiente.titulo}`
    : "Próximos Toques - Punk Medallo";
  const ogDescription = siguiente
    ? [
        siguiente.fecha ? formatearFecha(siguiente.fecha) : null,
        siguiente.lugar,
        siguiente.horaInicio,
        formatearPrecio(siguiente),
      ]
        .filter(Boolean)
        .join(" · ")
    : "Agenda de toques punk en Medellín: fechas, lugares, horarios y precios de los próximos conciertos.";

  return {
    title: "Próximos Toques",
    description:
      "Agenda de toques punk en Medellín: fechas, lugares, horarios y precios de los próximos conciertos. Enterate del toque antes que nadie.",
    alternates: {
      canonical: "/eventos",
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: "/eventos",
      type: "website",
      locale: "es_CO",
      siteName: "Punk Medallo",
      images: siguiente?.flyer
        ? [{ url: siguiente.flyer, width: 1080, height: 1350, type: "image/jpeg" }]
        : [{ url: LOGO_OG, width: 1200, height: 630, type: "image/jpeg" }],
    },
  };
}

export default async function Eventos() {
  const eventos = await obtenerEventos();
  const proximosList = proximos(eventos);

  const eventoSchema = proximosList.map((e) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": `${SITE_URL}/eventos#${e.id}`,
    name: [e.titulo, e.lugar ? ` - ${e.lugar}` : ""].join(""),
    description: captionExcerpt(e, 160),
    startDate: `${e.fecha}T${e.horaInicio ?? "20:00"}:00`,
    ...(e.horaFin ? { endDate: `${e.fecha}T${e.horaFin}:00` } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: `${SITE_URL}/eventos`,
    ...(e.lugar
      ? {
          location: {
            "@type": "Place",
            name: e.lugar,
            address: { "@type": "PostalAddress", addressLocality: "Medellín", addressCountry: "CO" },
          },
        }
      : {}),
    image: e.flyer,
    organizer: { "@type": "Organization", name: "Punk Medallo", url: SITE_URL },
  }));

  return (
    <>
      {eventoSchema.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventoSchema) }}
        />
      )}
      <EventosContent initialEventos={eventos} />
    </>
  );
}

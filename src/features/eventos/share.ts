import type { Evento } from "./types";
import { formatearFecha, formatearHora, formatearPrecio } from "./format";

export function deepLinkEvento(evento: Evento): string {
  return `https://punkmedallo.com/eventos#ev-${evento.id}`;
}

export function textoCompartir(evento: Evento): string {
  const partes: string[] = [evento.titulo];

  const detalle: string[] = [];
  if (evento.fecha) detalle.push(formatearFecha(evento.fecha));
  if (evento.horaInicio) detalle.push(formatearHora(evento.horaInicio));
  if (evento.lugar) detalle.push(evento.lugar);
  const precio = formatearPrecio(evento);
  if (precio) detalle.push(precio);
  if (detalle.length > 0) partes.push(detalle.join(" · "));

  partes.push(`Punk Medallo: ${deepLinkEvento(evento)}`);
  if (evento.permalink) partes.push(`Instagram: ${evento.permalink}`);

  return partes.join("\n");
}

export function whatsappUrl(evento: Evento): string {
  return `https://wa.me/?text=${encodeURIComponent(textoCompartir(evento))}`;
}

export async function compartirEvento(evento: Evento): Promise<"shared" | "copied" | "canceled"> {
  const texto = textoCompartir(evento);

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({ title: evento.titulo, text: texto });
      return "shared";
    } catch {
      // el usuario canceló o el navegador no soporta — caemos al portapapeles
    }
  }

  try {
    await navigator.clipboard.writeText(texto);
    return "copied";
  } catch {
    return "canceled";
  }
}

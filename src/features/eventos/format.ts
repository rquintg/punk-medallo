import type { Evento } from "./types";

export function fechaDesdeISO(iso: string): Date | null {
  const [anio, mes, dia] = iso.split("-").map(Number);
  if (!anio || !mes || !dia) return null;
  return new Date(anio, mes - 1, dia);
}

export function formatearFecha(iso: string, conAnio = true): string {
  const fecha = fechaDesdeISO(iso);
  if (!fecha) return "";
  const opciones: Intl.DateTimeFormatOptions = {
    weekday: "short",
    day: "numeric",
    month: "short",
    ...(conAnio ? { year: "numeric" } : {}),
  };
  return new Intl.DateTimeFormat("es-CO", opciones)
    .format(fecha)
    .replace(/\./g, "")
    .toUpperCase();
}

export function formatearHora(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  if (!h && h !== 0) return "";
  const periodo = h >= 12 ? "PM" : "AM";
  const hora = h % 12 === 0 ? 12 : h % 12;
  return `${hora}:${String(m).padStart(2, "0")} ${periodo}`;
}

export function diasHasta(iso: string, hoy = new Date()): number {
  const fecha = fechaDesdeISO(iso);
  if (!fecha) return Number.POSITIVE_INFINITY;
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return Math.round((fecha.getTime() - inicio.getTime()) / 86400000);
}

export function etiquetaProximidad(iso: string, hoy = new Date()): string | null {
  const dias = diasHasta(iso, hoy);
  if (dias === 0) return "HOY";
  if (dias === 1) return "MAÑANA";
  if (dias > 1 && dias <= 30) return `EN ${dias} DÍAS`;
  return null;
}

export function formatearPrecio(evento: Evento): string | null {
  if (evento.precioTipo === "libre") return "Entrada libre";
  if (evento.precioTipo === "no_cover") return "No cover";
  if (evento.precioTipo === "alimentos") return "Alimentos";
  if (evento.precio !== null) {
    return `$${evento.precio.toLocaleString("es-CO")}`;
  }
  return evento.precioTexto ?? null;
}

export function horaInicioEfectiva(evento: Evento): string | null {
  return evento.horaInicio ?? null;
}

export function tituloEvento(evento: Evento): string {
  return [evento.titulo, evento.lugar ? ` - ${evento.lugar}` : ""]
    .join("")
    .trim();
}

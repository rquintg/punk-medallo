import type { Evento } from "./types";
import { fechaDesdeISO, tituloEvento } from "./format";

const HORARIO_DEFECTO = "20:00";
const DURACION_HORAS = 4;

function aTimestamp(fechaISO: string, hora: string | null): number {
  const fecha = fechaDesdeISO(fechaISO) ?? new Date();
  const [h, m] = (hora ?? HORARIO_DEFECTO).split(":").map(Number);
  fecha.setHours(h ?? 20, m ?? 0, 0, 0);
  return fecha.getTime();
}

function fmtUtc(fecha: Date): string {
  return fecha.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function googleCalendarUrl(evento: Evento): string | null {
  if (!evento.fecha) return null;
  const inicio = new Date(aTimestamp(evento.fecha, evento.horaInicio));
  const fin = evento.horaFin
    ? new Date(aTimestamp(evento.fecha, evento.horaFin))
    : new Date(inicio.getTime() + DURACION_HORAS * 3600000);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: tituloEvento(evento),
    dates: `${fmtUtc(inicio)}/${fmtUtc(fin)}`,
    ...(evento.lugar ? { location: evento.lugar } : {}),
    ...(evento.precioTexto ? { details: `Precio: ${evento.precioTexto}` } : {}),
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function escaparIcs(texto: string): string {
  return texto
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Fecha local flotante (sin zona) para que el calendario del usuario la respete */
function formatoLocal(fecha: Date): string {
  return `${fecha.getFullYear()}${pad(fecha.getMonth() + 1)}${pad(fecha.getDate())}T${pad(fecha.getHours())}${pad(fecha.getMinutes())}00`;
}

export function contenidoIcs(evento: Evento): string {
  const fechaISO = evento.fecha ?? new Date().toISOString().slice(0, 10);
  const inicio = new Date(aTimestamp(fechaISO, evento.horaInicio));
  const fin = evento.horaFin
    ? new Date(aTimestamp(fechaISO, evento.horaFin))
    : new Date(inicio.getTime() + DURACION_HORAS * 3600000);

  const lineas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Punk Medallo//Eventos//ES",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${evento.id}@punkmedallo.com`,
    `DTSTAMP:${fmtUtc(new Date())}`,
    `DTSTART:${formatoLocal(inicio)}`,
    `DTEND:${formatoLocal(fin)}`,
    `SUMMARY:${escaparIcs(tituloEvento(evento))}`,
  ];

  if (evento.lugar) lineas.push(`LOCATION:${escaparIcs(evento.lugar)}`);
  if (evento.precioTexto) lineas.push(`DESCRIPTION:${escaparIcs(`Precio: ${evento.precioTexto}`)}`);
  if (evento.permalink) lineas.push(`URL:${escaparIcs(evento.permalink)}`);

  lineas.push("END:VEVENT", "END:VCALENDAR");
  return lineas.join("\r\n");
}

export function descargarIcs(evento: Evento): void {
  const blob = new Blob([contenidoIcs(evento)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `toque-${evento.id}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

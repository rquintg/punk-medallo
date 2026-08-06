import type { Evento, EventoTipo, PrecioTipo } from "./types";

const MESES: Record<string, number> = {
  enero: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  septiembre: 9,
  octubre: 10,
  noviembre: 11,
  diciembre: 12,
};

const DIAS_SEMANA = new Set([
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
]);

const JUNK_RE = /(compartir|comparte|sigue leyendo|publicado por|etiquetas|siguenos|mas informacion|visita|fuente|leer mas)/i;

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.]+/;
const URL_RE = /(https?:\/\/|www\.)\S+/i;
const HASHTAG_ONLY_RE = /^#[\w-]+$/;

export function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function esLineaInutil(linea: string): boolean {
  const limpia = linea.trim();
  if (!limpia) return true;
  if (EMAIL_RE.test(limpia)) return true;
  if (URL_RE.test(limpia)) return true;
  if (HASHTAG_ONLY_RE.test(limpia)) return true;
  if (/^#[\w-]+$/.test(limpia)) return true;
  if (/^\d{3}[-.\s]?\d{3}[-.\s]?\d{2,4}$/.test(limpia)) return true;
  return false;
}

function lineasUtiles(caption: string): string[] {
  return caption
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => !esLineaInutil(l));
}

interface FechaParseada {
  anio: number;
  mes: number;
  dia: number;
}

function parsearFecha(linea: string, referencia: Date): FechaParseada | null {
  const texto = normalizarTexto(linea);
  const match = texto.match(
    new RegExp(
      `(${[...DIAS_SEMANA].join("|")})\\s+(\\d{1,2})\\s+(?:de\\s+)?([a-zñ]+)\\s*[-–—.,]?\\s*(\\d{4})?`,
      "i"
    )
  );
  if (!match) return null;

  const dia = parseInt(match[2], 10);
  const mes = MESES[match[3]];
  if (!mes || dia < 1 || dia > 31) return null;

  let anio = match[4] ? parseInt(match[4], 10) : referencia.getFullYear();
  if (anio < 100) anio += 2000;

  const fecha = new Date(anio, mes - 1, dia);
  if (!match[4]) {
    const limite = new Date(referencia.getTime() - 45 * 24 * 60 * 60 * 1000);
    if (fecha.getTime() < limite.getTime()) {
      anio += 1;
      fecha.setFullYear(anio);
    }
  }

  return { anio: fecha.getFullYear(), mes: fecha.getMonth() + 1, dia };
}

function parsearHoras(linea: string): { inicio: string | null; fin: string | null } {
  const texto = normalizarTexto(linea);
  const horas: string[] = [];
  const re = /(\d{1,2})(?::(\d{2}))?\s*(a\.?\s*m\.?|p\.?\s*m\.?|am|pm)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto)) !== null) {
    let hora = parseInt(m[1], 10);
    const min = m[2] ? parseInt(m[2], 10) : 0;
    const meridiano = m[3].startsWith("p");
    if (meridiano && hora < 12) hora += 12;
    if (!meridiano && hora === 12) hora = 0;
    horas.push(`${String(hora).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
  }
  return {
    inicio: horas[0] ?? null,
    fin: horas.length > 1 ? horas[horas.length - 1] : null,
  };
}

function parsearPrecio(caption: string): {
  precio: number | null;
  precioTexto: string | null;
  precioTipo: PrecioTipo | null;
} {
  const texto = normalizarTexto(caption);

  if (/entrada\s+libre/.test(texto)) {
    return { precio: null, precioTexto: "Entrada libre", precioTipo: "libre" };
  }
  if (/no\s+cover/.test(texto)) {
    return { precio: null, precioTexto: "No cover", precioTipo: "no_cover" };
  }
  if (/alimentos/.test(texto)) {
    return { precio: null, precioTexto: "Alimentos", precioTipo: "alimentos" };
  }
  if (/aporte/.test(texto)) {
    return { precio: null, precioTexto: "Aporte", precioTipo: "libre" };
  }

  const valores: { monto: number; texto: string }[] = [];
  const re =
    /\$\s?(\d{1,3}(?:[.,]\d{3})*)\s*(lks?|mil|k)?/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto)) !== null) {
    const num = parseFloat(m[1].replace(/[.,]/g, ""));
    const sufijo = (m[2] ?? "").toLowerCase();
    let monto = num;
    if (sufijo.startsWith("lk") || sufijo === "k" || sufijo === "mil") {
      monto = num * 1000;
    } else if (!m[1].includes(".") && !m[1].includes(",")) {
      monto = num * 1000;
    }
    valores.push({ monto, texto: m[0] });
  }
  if (valores.length === 0) return { precio: null, precioTexto: null, precioTipo: null };

  const ultimo = valores[valores.length - 1];
  return { precio: ultimo.monto, precioTexto: ultimo.texto, precioTipo: "dinero" };
}

function extraerLugar(caption: string, titulo: string): string | null {
  const explicto = caption.match(/lugar\s*:\s*([^\n]{2,40})/i);
  if (explicto) {
    const lugar = explicto[1].replace(/^[:\-\s]+/, "").replace(/[.…]\s*$/, "").trim();
    if (lugar.length >= 2) return lugar;
  }

  const arroba = caption.match(/^@([a-z0-9._]{2,30})$/im);
  if (arroba) return arroba[1];

  const enTitulo = titulo.match(/(?:^|\s)en\s+([a-z0-9ñ'"&áéíóúÁÉÍÓÚ.\s]{2,30})$/i);
  if (enTitulo && enTitulo.index !== 0) {
    const lugar = enTitulo[1].trim().replace(/[.…]\s*$/, "");
    const soloCiudad = /^(medellin|bogota|colombia|envigado|bello|itagui|sabaneta)$/;
    if (
      lugar.length >= 2 &&
      lugar.length <= 25 &&
      !lugar.includes(",") &&
      !soloCiudad.test(normalizarTexto(lugar))
    ) {
      return lugar;
    }
  }

  return null;
}

function extraerTitulo(caption: string): string {
  const lineas = lineasUtiles(caption);
  for (const linea of lineas) {
    if (JUNK_RE.test(linea)) continue;
    const sinHashtags = linea
      .split(/\s+/)
      .filter((p) => !p.startsWith("#"))
      .join(" ");
    const limpio = sinHashtags.replace(/\s*[.…]{1,3}\s*$/, "").trim();
    if (limpio.length >= 2) return limpio;
  }
  return "Publicación";
}

export function parseCaptionEvento(
  media: {
    id: string;
    caption?: string | null;
    media_type?: string | null;
    image_url?: string | null;
    permalink?: string | null;
    timestamp?: string | null;
  }
): Evento {
  const caption = (media.caption ?? "").trim();
  const referencia = media.timestamp ? new Date(media.timestamp) : new Date();

  const titulo = extraerTitulo(caption);
  const fecha = parsearFecha(caption, referencia);
  const horas = parsearHoras(caption);
  const precio = parsearPrecio(caption);
  const lugar = extraerLugar(caption, titulo);

  const tipo: EventoTipo = fecha ? "evento" : "feed";

  return {
    id: media.id,
    tipo,
    titulo,
    fecha: fecha
      ? `${fecha.anio}-${String(fecha.mes).padStart(2, "0")}-${String(fecha.dia).padStart(2, "0")}`
      : null,
    horaInicio: horas.inicio,
    horaFin: horas.fin,
    lugar,
    precio: precio.precio,
    precioTexto: precio.precioTexto,
    precioTipo: precio.precioTipo,
    flyer: media.image_url ?? "",
    mediaType: media.media_type ?? "IMAGE",
    permalink: media.permalink ?? "",
    timestamp: media.timestamp ?? null,
    caption: caption || null,
  };
}

export function parseCaptionEventos(
  medias: Array<{
    id: string;
    caption?: string | null;
    media_type?: string | null;
    image_url?: string | null;
    permalink?: string | null;
    timestamp?: string | null;
  }>
): Evento[] {
  return medias
    .map(parseCaptionEvento)
    .filter((e) => e.flyer !== "");
}

export function esProximoEvento(evento: Evento, hoy = new Date()): boolean {
  if (!evento.fecha) return false;
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
  return evento.fecha >= hoyStr;
}

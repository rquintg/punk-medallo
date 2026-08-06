export type PrecioTipo = "dinero" | "libre" | "no_cover" | "alimentos";

export type EventoTipo = "evento" | "feed";

export interface Evento {
  id: string;
  tipo: EventoTipo;
  titulo: string;
  /** ISO date (yyyy-mm-dd) o null si no se pudo extraer */
  fecha: string | null;
  /** HH:mm (24h) o null */
  horaInicio: string | null;
  /** HH:mm (24h) o null */
  horaFin: string | null;
  lugar: string | null;
  /** Precio en COP o null */
  precio: number | null;
  /** Texto original del precio (ej. "$25 Lks") */
  precioTexto: string | null;
  precioTipo: PrecioTipo | null;
  flyer: string;
  mediaType: string;
  permalink: string;
  timestamp: string | null;
  caption: string | null;
}

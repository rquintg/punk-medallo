export type EstadoBoleta = 'valida' | 'usada' | 'anulada'

export interface EventoBoleto {
  id: string
  slug: string
  titulo: string
  descripcion: string | null
  lugar: string
  fechaEvento: string
  horaPuertas: string | null
  edadMinima: number | null
  imagenUrl: string | null
  imagenCardUrl: string | null
  activo: boolean
}

export interface TipoBoleta {
  id: string
  eventoId: string
  nombre: string
  precio: number
  cantidadTotal: number
  orden: number
  activo: boolean
  /** Agregados calculados en servicios (no columnas de BD) */
  vendidas?: number
  disponibles?: number
  /** Boletas escaneadas en puerta (estado='usada') */
  usadas?: number
}

export interface Boleta {
  id: string
  codigo: string
  pedidoId: string
  tipoId: string
  eventoId: string
  titularNombre: string
  titularEmail: string
  usuarioId: string | null
  estado: EstadoBoleta
  escaneadaEn: string | null
  createdAt: string
  /** Join opcional para UI */
  tipoNombre?: string
  eventoTitulo?: string
  eventoFecha?: string
  eventoLugar?: string
}

/** Máximo de boletas acumuladas por usuario+evento (anti-revendedores) */
export const MAX_BOLETAS_POR_PERSONA = 4

export const ESTADO_BOLETA_LABEL: Record<EstadoBoleta, string> = {
  valida: 'Válida',
  usada: 'Usada',
  anulada: 'Anulada',
}

export type TipoCupon = 'porcentaje' | 'fijo' | 'envio'

export interface Cupon {
  id: string
  codigo: string
  tipo: TipoCupon
  valor: number
  descuento_maximo: number | null
  monto_minimo: number
  fecha_inicio: string | null
  fecha_fin: string | null
  max_usos: number | null
  usos: number
  activo: boolean
  created_at: string
}

export type MotivoRechazo =
  | 'no_existe'
  | 'inactivo'
  | 'no_inicia'
  | 'vencido'
  | 'minimo'
  | 'sin_cupo'
  | 'ya_usado'

export interface ResultadoValidacion {
  valido: boolean
  motivo?: MotivoRechazo
  descuento: number
  minimo: number
  cupon?: {
    id: string
    codigo: string
    tipo: TipoCupon
    valor: number
    descuento_maximo: number | null
  }
}

export function motivoRechazoTexto(motivo: MotivoRechazo): string {
  switch (motivo) {
    case 'no_existe':
      return 'Ese código de cupón no existe'
    case 'inactivo':
      return 'El cupón ya no está disponible'
    case 'no_inicia':
      return 'El cupón aún no está activo'
    case 'vencido':
      return 'El cupón ya venció'
    case 'minimo':
      return 'Este cupón requiere un pedido mínimo'
    case 'sin_cupo':
      return 'El cupón agotó su cupo de usos'
    case 'ya_usado':
      return 'Ya usaste este cupón con ese correo'
    default:
      return 'El cupón no se puede aplicar'
  }
}
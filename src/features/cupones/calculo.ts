import type { TipoCupon } from '@/features/cupones/types'

/**
 * Descuento en COP según el tipo de cupón.
 * - porcentaje: round(subtotal * valor / 100), con tope opcional (descuento_maximo)
 * - fijo: valor exacto; nunca supera el subtotal
 * - envio: 0 aquí — el envío gratis se resuelve con la tarifa real del pedido
 */
export function calcularDescuento(
  tipo: TipoCupon,
  valor: number,
  descuentoMaximo: number | null,
  subtotal: number,
): number {
  if (subtotal <= 0) return 0

  if (tipo === 'porcentaje') {
    const bruto = Math.round((subtotal * valor) / 100)
    return Math.max(0, Math.min(bruto, descuentoMaximo ?? bruto, subtotal))
  }

  if (tipo === 'fijo') {
    return Math.max(0, Math.min(valor, subtotal))
  }

  return 0
}

/** Normaliza el código: mayúsculas y sin espacios */
export function normalizarCodigo(codigo: string): string {
  return codigo.trim().toUpperCase().replace(/\s+/g, '')
}
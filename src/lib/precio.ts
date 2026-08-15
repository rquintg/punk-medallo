export function descuentoEntero(descuento: number | null | undefined): number {
  const d = Math.round(Number(descuento) || 0)
  return Math.min(100, Math.max(0, d))
}

export function precioConDescuento(
  precio: number,
  descuento: number | null | undefined,
): number {
  const d = descuentoEntero(descuento)
  return d === 0 ? precio : Math.round((precio * (100 - d)) / 100)
}

export function ahorroConDescuento(
  precio: number,
  descuento: number | null | undefined,
): number {
  return precio - precioConDescuento(precio, descuento)
}

export function tieneDescuento(descuento: number | null | undefined): boolean {
  return descuentoEntero(descuento) > 0
}
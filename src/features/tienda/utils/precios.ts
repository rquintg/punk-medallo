export interface RangoPrecio {
  key: string
  label: string
  min: number
  max: number | null
}

export const PRICE_RANGES: Record<string, RangoPrecio> = {
  barato: { key: 'barato', label: 'Menos de $50K', min: 0, max: 50000 },
  medio: { key: 'medio', label: '$50K - $80K', min: 50000, max: 80000 },
  caro: { key: 'caro', label: 'Más de $80K', min: 80000, max: null },
}

export function getRangoPrecio(key: string): RangoPrecio | null {
  return PRICE_RANGES[key] ?? null
}

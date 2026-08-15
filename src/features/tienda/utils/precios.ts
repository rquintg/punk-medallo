const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatearPesos(n: number): string {
  return currencyFormatter.format(n)
}

export interface RangoPrecioParse {
  min?: number
  max?: number
}

const valorEntero = (v: unknown): number | null => {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null
}

export function parsePrecios(
  searchParams: { precio_min?: unknown; precio_max?: unknown },
): RangoPrecioParse {
  const rawMin = valorEntero(searchParams.precio_min)
  const rawMax = valorEntero(searchParams.precio_max)

  if (rawMin === null && rawMax === null) return {}

  let min = rawMin ?? 0
  let max = rawMax ?? Number.POSITIVE_INFINITY

  if (min > max) {
    const swap = min
    min = max
    max = swap
  }

  const result: RangoPrecioParse = {}
  if (min > 0) result.min = min
  if (Number.isFinite(max)) result.max = max
  return result
}
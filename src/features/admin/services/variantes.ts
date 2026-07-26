import { getSupabaseAdmin } from './supabase-admin'

export interface VarianteRow {
  id: string
  producto_id: string
  talla: string | null
  color: string | null
  stock: number
  sku: string | null
}

export async function getVariantesByProducto(productoId: string): Promise<VarianteRow[]> {
  const supabase = getSupabaseAdmin()
  const { data } = await (supabase.from('producto_variantes') as any)
    .select('*')
    .eq('producto_id', productoId)
    .order('color', { ascending: true })
    .order('talla', { ascending: true })

  return (data ?? []) as VarianteRow[]
}

export interface VarianteAgg {
  producto_id: string
  stock_total: number
  count: number
}

export async function getVariantesAggregated(
  productoIds: string[],
): Promise<Map<string, { stock_total: number; count: number }>> {
  if (productoIds.length === 0) return new Map()

  const supabase = getSupabaseAdmin()
  const { data } = await (supabase.from('producto_variantes') as any)
    .select('producto_id, stock')
    .in('producto_id', productoIds)

  const rows = (data ?? []) as { producto_id: string; stock: number }[]

  const map = new Map<string, { stock_total: number; count: number }>()
  for (const r of rows) {
    const prev = map.get(r.producto_id) ?? { stock_total: 0, count: 0 }
    prev.stock_total += r.stock
    prev.count += 1
    map.set(r.producto_id, prev)
  }

  return map
}

import { getSupabaseAdmin } from './supabase-admin'
import { getVariantesAggregated } from './variantes'

export interface ProductoImagen {
  id: string
  url: string
  alt: string
  orden: number
  color: string | null
}

export interface ProductoRow {
  id: string
  slug: string
  nombre: string
  descripcion: string
  precio: number
  descuento: number
  stock: number
  stock_efectivo: number
  genero: string
  tallas_disponibles: string[]
  colores_disponibles: string[]
  destacado: boolean
  activo: boolean
  categoria_id: string | null
  fecha_creacion: string
  categorias?: { nombre: string; slug: string } | null
  producto_imagenes?: ProductoImagen[]
}

export interface ProductosResponse {
  data: ProductoRow[]
  total: number
}

function mergeStock(
  productos: ProductoRow[],
  variantesMap: Map<string, { stock_total: number; count: number }>,
): ProductoRow[] {
  return productos.map((p) => {
    const agg = variantesMap.get(p.id)
    return {
      ...p,
      stock_efectivo: agg ? agg.stock_total : p.stock,
    }
  })
}

export async function getProductos(
  page: number,
  search?: string,
  pageSize = 20,
): Promise<ProductosResponse> {
  const supabase = getSupabaseAdmin()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = (supabase.from('productos') as any)
    .select('*, categorias(nombre, slug), producto_imagenes(*)', { count: 'exact' })

  if (search) {
    query = query.ilike('nombre', `%${search}%`)
  }

  const { data, count } = await query
    .order('fecha_creacion', { ascending: false })
    .range(from, to)

  const productos = (data ?? []) as ProductoRow[]
  productos.forEach((p) => {
    if (p.producto_imagenes) {
      p.producto_imagenes.sort((a, b) => a.orden - b.orden)
    }
  })
  const ids = productos.map((p) => p.id)
  const variantesMap = await getVariantesAggregated(ids)
  const dataWithStock = mergeStock(productos, variantesMap)

  return {
    data: dataWithStock as ProductoRow[],
    total: count ?? 0,
  }
}

export async function getProductoById(id: string) {
  const supabase = getSupabaseAdmin()
  const { data } = await (supabase.from('productos') as any)
    .select('*, categorias(nombre, slug), producto_imagenes(*)')
    .eq('id', id)
    .single()

  if (!data) return null

  const producto = data as ProductoRow
  if (producto.producto_imagenes) {
    producto.producto_imagenes.sort((a, b) => a.orden - b.orden)
  }
  const variantesMap = await getVariantesAggregated([id])
  const merged = mergeStock([producto], variantesMap)
  return merged[0] ?? null
}

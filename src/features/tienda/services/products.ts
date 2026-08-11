import type { Producto, ProductoFilters, Talla } from '../types';
import { supabase } from '@/lib/supabase';
import { mapDbProductoToProducto, type DbProduct } from '../utils/mapper';

export type ProductoOrden =
  | 'relevancia'
  | 'precio-asc'
  | 'precio-desc'
  | 'nombre-asc'
  | 'nombre-desc';

export interface ProductosPage {
  productos: Producto[]
  total: number
}

export const PAGE_SIZE = 12
const MAX_PAGE_SIZE = 48

const PRODUCTO_QUERY = '*, producto_imagenes(*), producto_variantes(*), categorias(*)'

async function getProductosIdsPorTalla(talla: Talla): Promise<string[]> {
  const { data } = await supabase
    .from('producto_variantes')
    .select('producto_id')
    .eq('talla', talla)
    .gt('stock', 0)

  return [...new Set(data?.map((v) => v.producto_id) ?? [])]
}

function applyFilters(
  filters: ProductoFilters,
  select: string,
) {
  let query = supabase
    .from('productos')
    .select(select)
    .eq('activo', true)

  if (filters.categoria_id) {
    query = query.eq('categoria_id', filters.categoria_id)
  }

  if (filters.genero) {
    query = query.eq('genero', filters.genero)
  }

  if (filters.precio_min !== undefined) {
    query = query.gte('precio', filters.precio_min)
  }

  if (filters.precio_max !== undefined) {
    query = query.lte('precio', filters.precio_max)
  }

  if (filters.q) {
    query = query.or(
      `nombre.ilike.%${filters.q}%,descripcion.ilike.%${filters.q}%`,
    )
  }

  return query
}

export async function getProductosFiltrados(filters?: ProductoFilters): Promise<Producto[]> {
  let query = applyFilters(filters ?? {}, PRODUCTO_QUERY)

  if (filters?.talla) {
    const ids = await getProductosIdsPorTalla(filters.talla)
    if (ids.length === 0) return []
    query = query.in('id', ids)
  }

  const { data, error } = await query

  if (error) {
    console.error('getProductosFiltrados error:', error);
    return [];
  }

  return (data ?? []).map((row) => mapDbProductoToProducto(row as unknown as DbProduct));
}

export async function getProductosPage(
  filters: ProductoFilters = {},
  orden: ProductoOrden = 'relevancia',
  page = 1,
  pageSize = PAGE_SIZE,
): Promise<ProductosPage> {
  const safePage = Math.max(1, page)
  const safePageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, pageSize))
  const from = (safePage - 1) * safePageSize
  const to = from + safePageSize - 1

  let query = applyFilters(filters, PRODUCTO_QUERY)
  const countQuery = applyFilters(filters, 'id')

  if (filters.talla) {
    const ids = await getProductosIdsPorTalla(filters.talla)
    if (ids.length === 0) return { productos: [], total: 0 }
    query = query.in('id', ids)
    countQuery.in('id', ids)
  }

  switch (orden) {
    case 'precio-asc':
      query = query.order('precio', { ascending: true })
      break
    case 'precio-desc':
      query = query.order('precio', { ascending: false })
      break
    case 'nombre-asc':
      query = query.order('nombre', { ascending: true })
      break
    case 'nombre-desc':
      query = query.order('nombre', { ascending: false })
      break
    default:
      query = query
        .order('destacado', { ascending: false })
        .order('fecha_creacion', { ascending: false })
  }

  const [{ data, error }, { count }] = await Promise.all([
    query.range(from, to),
    countQuery,
  ])

  if (error) {
    console.error('getProductosPage error:', error)
    return { productos: [], total: 0 }
  }

  return {
    productos: (data ?? []).map((row) => mapDbProductoToProducto(row as unknown as DbProduct)),
    total: count ?? 0,
  }
}

export async function getProductosDestacados(): Promise<Producto[]> {
  const { data, error } = await supabase
    .from('productos')
    .select(PRODUCTO_QUERY)
    .eq('destacado', true)
    .eq('activo', true)
    .order('fecha_creacion', { ascending: false });

  if (error) {
    console.error('getProductosDestacados error:', error);
    return [];
  }

  return (data ?? []).map(mapDbProductoToProducto);
}

export async function getProductoBySlug(slug: string): Promise<Producto | null> {
  const { data, error } = await supabase
    .from('productos')
    .select(PRODUCTO_QUERY)
    .eq('slug', slug)
    .eq('activo', true)
    .single();

  if (error || !data) return null;

  return mapDbProductoToProducto(data);
}

import type { Producto, ProductoFilters, Talla } from '../types';
import { supabase } from '@/lib/supabase';
import { getSupabaseAdmin } from '@/features/admin/services/supabase-admin';
import { mapDbProductoToProducto, type DbProduct } from '../utils/mapper';

export type ProductoOrden =
  | 'relevancia'
  | 'precio-asc'
  | 'precio-desc'
  | 'nombre-asc'
  | 'nombre-desc'
  | 'mas-vendidos'
  | 'novedades'
  | 'descuento-desc';

export interface ProductosPage {
  productos: Producto[]
  total: number
}

export const PAGE_SIZE = 12
const MAX_PAGE_SIZE = 48

export interface PrecioLimites {
  min: number
  max: number
}

export async function getPrecioLimites(): Promise<PrecioLimites> {
  const [minRes, maxRes] = await Promise.all([
    supabase
      .from('productos')
      .select('precio')
      .eq('activo', true)
      .order('precio', { ascending: true })
      .limit(1),
    supabase
      .from('productos')
      .select('precio')
      .eq('activo', true)
      .order('precio', { ascending: false })
      .limit(1),
  ])

  const min = minRes.data?.[0]?.precio ?? 0
  const max = maxRes.data?.[0]?.precio ?? Math.max(min, 1)

  return { min, max: Math.max(max, min) }
}

const PRODUCTO_QUERY = '*, producto_imagenes(*), producto_variantes(*), categorias(*)'

async function getProductosIdsPorTallas(tallas: Talla[]): Promise<string[]> {
  const { data } = await supabase
    .from('producto_variantes')
    .select('producto_id')
    .in('talla', tallas)
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

  if (filters.generos?.length) {
    query = query.in('genero', filters.generos)
  }

  if (filters.precio_min !== undefined) {
    query = query.gte('precio', filters.precio_min)
  }

  if (filters.precio_max !== undefined) {
    query = query.lte('precio', filters.precio_max)
  }

  if (filters.oferta) {
    query = query.gt('descuento', 0)
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

  if (filters?.tallas?.length) {
    const ids = await getProductosIdsPorTallas(filters.tallas)
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

  // Ranking mas vendidos: respeta filtros activos + ordena por ventas 30d
  if (orden === 'mas-vendidos') {
    return getProductosPageMasVendidos(filters, safePage, safePageSize, from, to)
  }

  let query = applyFilters(filters, PRODUCTO_QUERY)
  const countQuery = applyFilters(filters, 'id')

  if (filters.tallas?.length) {
    const ids = await getProductosIdsPorTallas(filters.tallas)
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
    case 'novedades':
      query = query.order('fecha_creacion', { ascending: false })
      break
    case 'descuento-desc':
      query = query.order('descuento', { ascending: false }).order('fecha_creacion', { ascending: false })
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

const ESTADOS_VALIDOS_RANKING = ['aprobado', 'preparando', 'enviado', 'entregado'] as const

function inicioDiaBogotaISO(diasAtras: number): string {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' })
  const d = new Date(Date.now() - diasAtras * 86_400_000)
  return `${fmt.format(d)}T05:00:00.000Z`
}

async function getRankingIds(filters: ProductoFilters, dias = 30): Promise<string[] | null> {
  const desde = inicioDiaBogotaISO(dias - 1)
  const admin = getSupabaseAdmin()
  const { data: pedidos } = await admin
    .from('pedidos')
    .select('id')
    .in('estado', [...ESTADOS_VALIDOS_RANKING])
    .gte('created_at', desde)
  const idsPedidos = (pedidos ?? []).map((p: any) => p.id)
  if (idsPedidos.length === 0) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client sin Database generic (patrón tienda: as unknown as)
  const { data: items } = await (admin.from('pedido_items') as any)
    .select('producto_id, cantidad, pedido_id')
    .in('pedido_id', idsPedidos)
  if (!items || items.length === 0) return []
  const map = new Map<string, number>()
  for (const it of items as { producto_id: string; cantidad: number }[]) {
    if (!it.producto_id) continue
    map.set(it.producto_id, (map.get(it.producto_id) ?? 0) + (it.cantidad ?? 0))
  }
  let ranking = [...map.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id)
  // Si hay filtros de categoria/genero/oferta/q: recorta ranking a los que pasan el filtro
  if (filters.categoria_id || filters.generos?.length || filters.oferta || filters.q) {
    const { data: filtrados } = await applyFilters(filters, 'id')
    const setFiltrados = new Set((filtrados ?? []).map((r: any) => r.id))
    ranking = ranking.filter((id) => setFiltrados.has(id))
  }
  if (filters.tallas?.length) {
    const idsTalla = await getProductosIdsPorTallas(filters.tallas)
    const setTalla = new Set(idsTalla)
    ranking = ranking.filter((id) => setTalla.has(id))
  }
  return ranking
}

async function getProductosPageMasVendidos(
  filters: ProductoFilters,
  safePage: number,
  safePageSize: number,
  from: number,
  to: number,
): Promise<ProductosPage> {
  const ranking = await getRankingIds(filters, 30)
  if (ranking === null) return { productos: [], total: 0 }
  if (ranking.length === 0) {
    // Sin ventas en 30d: fallback a relevancia
    let q = applyFilters(filters, PRODUCTO_QUERY).order('destacado', { ascending: false }).order('fecha_creacion', { ascending: false })
    let cq = applyFilters(filters, 'id')
    if (filters.tallas?.length) {
      const ids = await getProductosIdsPorTallas(filters.tallas)
      if (ids.length === 0) return { productos: [], total: 0 }
      q = q.in('id', ids)
      cq = cq.in('id', ids)
    }
    const [{ data, error }, { count }] = await Promise.all([q.range(from, to), cq])
    if (error) return { productos: [], total: 0 }
    return { productos: (data ?? []).map((r) => mapDbProductoToProducto(r as unknown as DbProduct)), total: count ?? 0 }
  }
  const total = ranking.length
  const pageIds = ranking.slice(from, to + 1)
  if (pageIds.length === 0) return { productos: [], total }
  const { data, error } = await supabase.from('productos').select(PRODUCTO_QUERY).in('id', pageIds).eq('activo', true)
  if (error || !data) return { productos: [], total }
  const byId = new Map((data as unknown as DbProduct[]).map((r) => [r.id, r]))
  const ordenados = pageIds.map((id) => byId.get(id)).filter(Boolean) as DbProduct[]
  return { productos: ordenados.map(mapDbProductoToProducto), total }
}

export async function getProductosMasPedidos(limit = 4, dias = 30): Promise<Producto[]> {
  const ranking = await getRankingIds({}, dias)
  if (!ranking || ranking.length === 0) return []
  const ids = ranking.slice(0, limit)
  const { data, error } = await supabase.from('productos').select(PRODUCTO_QUERY).in('id', ids).eq('activo', true)
  if (error || !data) return []
  const byId = new Map((data as unknown as DbProduct[]).map((r) => [r.id, r]))
  return ids.map((id) => byId.get(id)).filter((v): v is DbProduct => Boolean(v)).map(mapDbProductoToProducto)
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

export async function getProductosEnOferta(limit = 8): Promise<Producto[]> {
  const { data, error } = await supabase
    .from('productos')
    .select(PRODUCTO_QUERY)
    .eq('activo', true)
    .gt('descuento', 0)
    .order('descuento', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('getProductosEnOferta error:', error);
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

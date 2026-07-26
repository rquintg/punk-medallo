import type { Producto, ProductoFilters } from '../types';
import { supabase } from '@/lib/supabase';
import { mapDbProductoToProducto } from '../utils/mapper';

const PRODUCTO_QUERY = '*, producto_imagenes(*), producto_variantes(*), categorias(*)'

export async function getProductosFiltrados(filters?: ProductoFilters): Promise<Producto[]> {
  let query = supabase
    .from('productos')
    .select(PRODUCTO_QUERY)
    .eq('activo', true)

  if (filters?.categoria_id) {
    query = query.eq('categoria_id', filters.categoria_id)
  }

  if (filters?.genero) {
    query = query.eq('genero', filters.genero)
  }

  if (filters?.precio_min !== undefined) {
    query = query.gte('precio', filters.precio_min)
  }

  if (filters?.precio_max !== undefined) {
    query = query.lte('precio', filters.precio_max)
  }

  if (filters?.q) {
    query = query.or(
      `nombre.ilike.%${filters.q}%,descripcion.ilike.%${filters.q}%`,
    )
  }

  if (filters?.talla) {
    const { data: ids } = await supabase
      .from('producto_variantes')
      .select('producto_id')
      .eq('talla', filters.talla)
      .gt('stock', 0)

    const productIds = [...new Set(ids?.map(v => v.producto_id) ?? [])]
    if (productIds.length === 0) return []
    query = query.in('id', productIds)
  }

  const { data, error } = await query

  if (error) {
    console.error('getProductosFiltrados error:', error);
    return [];
  }

  return (data ?? []).map(mapDbProductoToProducto);
}

export async function getProductosDestacados(): Promise<Producto[]> {
  const { data, error } = await supabase
    .from('productos')
    .select(PRODUCTO_QUERY)
    .eq('destacado', true)
    .eq('activo', true);

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

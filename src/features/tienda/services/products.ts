import type { Producto, Categoria } from '../types';
import { supabase } from '@/lib/supabase';
import { mapDbProductoToProducto } from '../utils/mapper';

const PRODUCTO_QUERY = '*, producto_imagenes(*), producto_variantes(*)'

export async function getProductos(): Promise<Producto[]> {
  const { data, error } = await supabase
    .from('productos')
    .select(PRODUCTO_QUERY);

  if (error) {
    console.error('getProductos error:', error);
    return [];
  }

  return (data ?? []).map(mapDbProductoToProducto);
}

export async function getProductosDestacados(): Promise<Producto[]> {
  const { data, error } = await supabase
    .from('productos')
    .select(PRODUCTO_QUERY)
    .eq('destacado', true);

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
    .single();

  if (error || !data) return null;

  return mapDbProductoToProducto(data);
}

export async function getProductosByCategoria(categoria: Categoria): Promise<Producto[]> {
  const { data, error } = await supabase
    .from('productos')
    .select(PRODUCTO_QUERY)
    .eq('categoria', categoria);

  if (error) {
    console.error('getProductosByCategoria error:', error);
    return [];
  }

  return (data ?? []).map(mapDbProductoToProducto);
}

export async function getProductosByQuery(query: string): Promise<Producto[]> {
  const q = query.trim();
  if (!q) return getProductos();

  const { data, error } = await supabase
    .from('productos')
    .select(PRODUCTO_QUERY)
    .or(
      `nombre.ilike.%${q}%,descripcion.ilike.%${q}%,categoria.ilike.%${q}%,genero.ilike.%${q}%`,
    );

  if (error) {
    console.error('getProductosByQuery error:', error);
    return [];
  }

  return (data ?? []).map(mapDbProductoToProducto);
}


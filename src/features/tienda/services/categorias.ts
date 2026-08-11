import { supabase } from '@/lib/supabase'
import type { CategoriaInfo } from '../types'

export async function getCategorias(): Promise<CategoriaInfo[]> {
  const { data, error } = await supabase
    .from('categorias')
    .select('id, nombre, slug, descripcion')
    .order('nombre')

  if (error) {
    console.error('getCategorias error:', error)
    return []
  }

  return data ?? []
}

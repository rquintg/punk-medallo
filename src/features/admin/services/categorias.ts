import { getSupabaseAdmin } from './supabase-admin'

export interface CategoriaRow {
  id: string
  nombre: string
  slug: string
  descripcion: string | null
}

export async function getCategorias(): Promise<CategoriaRow[]> {
  const supabase = getSupabaseAdmin()
  const { data } = await (supabase.from('categorias') as any)
    .select('id, nombre, slug, descripcion')
    .order('nombre')
  return (data ?? []) as CategoriaRow[]
}

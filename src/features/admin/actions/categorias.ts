'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '../services/supabase-admin'
import { requirePermissionAction } from '../utils/auth-server'

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúüñ]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function createCategoria(formData: FormData) {
  await requirePermissionAction('delete_products')
  const supabase = getSupabaseAdmin()
  const nombre = formData.get('nombre') as string
  const slug = (formData.get('slug') as string) || slugify(nombre)
  const descripcion = (formData.get('descripcion') as string) || null

  const { error } = await (supabase.from('categorias') as any).insert({ nombre, slug, descripcion })
  if (error) throw new Error(error.message)

  revalidatePath('/admin/categorias')
}

export async function updateCategoria(id: string, formData: FormData) {
  await requirePermissionAction('delete_products')
  const supabase = getSupabaseAdmin()
  const nombre = formData.get('nombre') as string
  const descripcion = (formData.get('descripcion') as string) || null

  const patch: Record<string, unknown> = { nombre, descripcion }
  const slug = ((formData.get('slug') as string) || '').trim()
  if (slug) {
    patch.slug = slug
  }

  const { error } = await (supabase.from('categorias') as any)
    .update(patch)
    .eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/categorias')
}

export async function deleteCategoria(id: string) {
  await requirePermissionAction('delete_products')
  const supabase = getSupabaseAdmin()

  const { count } = await (supabase.from('productos') as any)
    .select('id', { count: 'exact', head: true })
    .eq('categoria_id', id)

  if (count && count > 0) {
    throw new Error(`No se puede eliminar: ${count} producto(s) usan esta categoría`)
  }

  const { error } = await (supabase.from('categorias') as any).delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/categorias')
}

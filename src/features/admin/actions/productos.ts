'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '../services/supabase-admin'

function genSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúüñ]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function createProducto(formData: FormData) {
  const supabase = getSupabaseAdmin()

  const nombre = formData.get('nombre') as string
  const slug = (formData.get('slug') as string) || genSlug(nombre)
  const descripcion = formData.get('descripcion') as string
  const precio = Number(formData.get('precio'))
  const stock = Number(formData.get('stock'))
  const genero = formData.get('genero') as string
  const categoria_id = (formData.get('categoria_id') as string) || null
  const destacado = formData.get('destacado') === 'true'
  const activo = formData.get('activo') === 'true'

  const tallas_raw = (formData.get('tallas_disponibles') as string) || ''
  const colores_raw = (formData.get('colores_disponibles') as string) || ''
  const tallas_disponibles = tallas_raw.split(',').map((t) => t.trim()).filter(Boolean)
  const colores_disponibles = colores_raw.split(',').map((c) => c.trim()).filter(Boolean)

  const { error } = await (supabase.from('productos') as any).insert({
    slug,
    nombre,
    descripcion,
    precio,
    stock,
    genero,
    categoria_id,
    destacado,
    activo,
    tallas_disponibles,
    colores_disponibles,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/admin/productos')
}

export async function updateProducto(id: string, formData: FormData) {
  const supabase = getSupabaseAdmin()

  const nombre = formData.get('nombre') as string
  const slug = (formData.get('slug') as string) || genSlug(nombre)
  const descripcion = formData.get('descripcion') as string
  const precio = Number(formData.get('precio'))
  const stock = Number(formData.get('stock'))
  const genero = formData.get('genero') as string
  const categoria_id = (formData.get('categoria_id') as string) || null
  const destacado = formData.get('destacado') === 'true'
  const activo = formData.get('activo') === 'true'

  const tallas_raw = (formData.get('tallas_disponibles') as string) || ''
  const colores_raw = (formData.get('colores_disponibles') as string) || ''
  const tallas_disponibles = tallas_raw.split(',').map((t) => t.trim()).filter(Boolean)
  const colores_disponibles = colores_raw.split(',').map((c) => c.trim()).filter(Boolean)

  const { error } = await (supabase.from('productos') as any)
    .update({
      slug,
      nombre,
      descripcion,
      precio,
      stock,
      genero,
      categoria_id,
      destacado,
      activo,
      tallas_disponibles,
      colores_disponibles,
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/productos')
}

export async function deleteProducto(id: string) {
  const supabase = getSupabaseAdmin()

  const { error } = await (supabase.from('productos') as any).delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/productos')
}

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

  const { data, error } = await (supabase.from('productos') as any).insert({
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
  }).select('id').single()

  if (error) throw new Error(error.message)

  revalidatePath('/admin/productos')
  return data.id
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

  const { data: imagenes } = await (supabase.from('producto_imagenes') as any)
    .select('url')
    .eq('producto_id', id)

  for (const img of imagenes ?? []) {
    const path = storagePathFromUrl(img.url)
    if (path) {
      await supabase.storage.from('productos').remove([path])
    }
  }

  const { error } = await (supabase.from('productos') as any).delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/productos')
}

function storagePathFromUrl(url: string): string {
  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/productos/`
  return url.startsWith(base) ? url.slice(base.length) : ''
}

export async function subirImagen(productoId: string, slug: string, formData: FormData) {
  const supabase = getSupabaseAdmin()

  const file = formData.get('file') as File | null
  const alt = (formData.get('alt') as string) || ''
  const color = (formData.get('color') as string) || null

  if (!file || file.size === 0) throw new Error('Archivo requerido')

  const ext = file.name.split('.').pop()
  const path = `${slug}/${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('productos')
    .upload(path, file, { upsert: true })

  if (uploadError) throw new Error(uploadError.message)

  const { data: publicUrlData } = supabase.storage
    .from('productos')
    .getPublicUrl(path)

  const { data: maxOrden } = await (supabase.from('producto_imagenes') as any)
    .select('orden')
    .eq('producto_id', productoId)
    .order('orden', { ascending: false })
    .limit(1)

  const orden = (maxOrden?.[0]?.orden ?? -1) + 1

  const { error: insertError } = await (supabase.from('producto_imagenes') as any).insert({
    producto_id: productoId,
    url: publicUrlData.publicUrl,
    alt,
    orden,
    color,
  })

  if (insertError) {
    await supabase.storage.from('productos').remove([path])
    throw new Error(insertError.message)
  }

  revalidatePath(`/admin/productos/${productoId}`)
  revalidatePath('/admin/productos')
}

export async function eliminarImagen(imagenId: string, url: string) {
  const supabase = getSupabaseAdmin()

  const path = storagePathFromUrl(url)
  if (path) {
    await supabase.storage.from('productos').remove([path])
  }

  const { error } = await (supabase.from('producto_imagenes') as any)
    .delete()
    .eq('id', imagenId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/productos')
}

export async function actualizarAltImagen(imagenId: string, alt: string) {
  const supabase = getSupabaseAdmin()

  const { error } = await (supabase.from('producto_imagenes') as any)
    .update({ alt })
    .eq('id', imagenId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/productos')
}

export async function actualizarColorImagen(imagenId: string, color: string | null) {
  const supabase = getSupabaseAdmin()

  const { error } = await (supabase.from('producto_imagenes') as any)
    .update({ color })
    .eq('id', imagenId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/productos')
}

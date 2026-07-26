'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '../services/supabase-admin'

export async function createVariante(productoId: string, formData: FormData) {
  const supabase = getSupabaseAdmin()

  const talla = (formData.get('talla') as string) || null
  const color = (formData.get('color') as string) || null
  const stock = Number(formData.get('stock'))
  const sku = (formData.get('sku') as string) || null

  const { error } = await (supabase.from('producto_variantes') as any).insert({
    producto_id: productoId,
    talla,
    color,
    stock,
    sku,
  })

  if (error) throw new Error(error.message)

  revalidatePath(`/admin/productos/${productoId}`)
}

export async function updateVariante(id: string, formData: FormData) {
  const supabase = getSupabaseAdmin()

  const talla = (formData.get('talla') as string) || null
  const color = (formData.get('color') as string) || null
  const stock = Number(formData.get('stock'))
  const sku = (formData.get('sku') as string) || null

  const { error } = await (supabase.from('producto_variantes') as any)
    .update({ talla, color, stock, sku })
    .eq('id', id)

  if (error) throw new Error(error.message)

  const { data: v } = await (supabase.from('producto_variantes') as any)
    .select('producto_id')
    .eq('id', id)
    .single()

  if (v) revalidatePath(`/admin/productos/${v.producto_id}`)
}

export async function deleteVariante(id: string) {
  const supabase = getSupabaseAdmin()

  const { data: v } = await (supabase.from('producto_variantes') as any)
    .select('producto_id')
    .eq('id', id)
    .single()

  const { error } = await (supabase.from('producto_variantes') as any).delete().eq('id', id)
  if (error) throw new Error(error.message)

  if (v) revalidatePath(`/admin/productos/${v.producto_id}`)
}

'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '../services/supabase-admin'
import { requirePermissionAction } from '../utils/auth-server'

export interface VarianteInput {
  talla: string | null
  color: string | null
  stock: number
  sku: string | null
}

export async function createVariante(productoId: string, data: VarianteInput) {
  await requirePermissionAction('edit_products')
  const supabase = getSupabaseAdmin()

  const { error } = await (supabase.from('producto_variantes') as any).insert({
    producto_id: productoId,
    talla: data.talla,
    color: data.color,
    stock: data.stock,
    sku: data.sku,
  })

  if (error) throw new Error(error.message)

  revalidatePath(`/admin/productos/${productoId}`)
}

export async function updateVariante(id: string, data: VarianteInput) {
  await requirePermissionAction('edit_products')
  const supabase = getSupabaseAdmin()

  const { error } = await (supabase.from('producto_variantes') as any)
    .update({ talla: data.talla, color: data.color, stock: data.stock, sku: data.sku })
    .eq('id', id)

  if (error) throw new Error(error.message)

  const { data: v } = await (supabase.from('producto_variantes') as any)
    .select('producto_id')
    .eq('id', id)
    .single()

  if (v) revalidatePath(`/admin/productos/${v.producto_id}`)
}

export async function deleteVariante(id: string) {
  await requirePermissionAction('edit_products')
  const supabase = getSupabaseAdmin()

  const { data: v } = await (supabase.from('producto_variantes') as any)
    .select('producto_id')
    .eq('id', id)
    .single()

  const { error } = await (supabase.from('producto_variantes') as any).delete().eq('id', id)
  if (error) throw new Error(error.message)

  if (v) revalidatePath(`/admin/productos/${v.producto_id}`)
}
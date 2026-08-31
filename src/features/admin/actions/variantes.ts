'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '../services/supabase-admin'
import { getRolActual, getUsuarioActual, requirePermissionAction } from '../utils/auth-server'
import { notificarStockDisponible } from '../services/avisos-stock'

async function assertOwner(productoId: string) {
  const rol = await getRolActual()
  if (rol !== 'publicador') return
  const usuario = await getUsuarioActual()
  if (!usuario) throw new Error('No autenticado')
  const supabase = getSupabaseAdmin()
  const { data } = await (supabase.from('productos') as any).select('owner_id').eq('id', productoId).maybeSingle()
  if (!data || data.owner_id !== usuario.id) throw new Error('No tienes permiso para modificar este producto')
}

export interface VarianteInput {
  talla: string | null
  color: string | null
  stock: number
  sku: string | null
}

export async function createVariante(productoId: string, data: VarianteInput) {
  await requirePermissionAction('edit_products')
  await assertOwner(productoId)
  const supabase = getSupabaseAdmin()

  const { error } = await (supabase.from('producto_variantes') as any).insert({
    producto_id: productoId,
    talla: data.talla,
    color: data.color,
    stock: data.stock,
    sku: data.sku,
  })

  if (error) throw new Error(error.message)

  await notificarStockDisponible(productoId)

  revalidatePath(`/admin/productos/${productoId}`)
}

export async function updateVariante(id: string, data: VarianteInput) {
  await requirePermissionAction('edit_products')
  const supabase = getSupabaseAdmin()
  // owner check via producto_id
  const { data: existing } = await (supabase.from('producto_variantes') as any).select('producto_id').eq('id', id).single()
  if (existing) await assertOwner(existing.producto_id)

  const { error } = await (supabase.from('producto_variantes') as any)
    .update({ talla: data.talla, color: data.color, stock: data.stock, sku: data.sku })
    .eq('id', id)

  if (error) throw new Error(error.message)

  const { data: v } = await (supabase.from('producto_variantes') as any)
    .select('producto_id')
    .eq('id', id)
    .single()

  if (v) {
    await notificarStockDisponible(v.producto_id)
    revalidatePath(`/admin/productos/${v.producto_id}`)
  }
}

export async function deleteVariante(id: string) {
  await requirePermissionAction('edit_products')
  const supabase = getSupabaseAdmin()

  const { data: v } = await (supabase.from('producto_variantes') as any)
    .select('producto_id')
    .eq('id', id)
    .single()
  if (v) await assertOwner(v.producto_id)

  const { error } = await (supabase.from('producto_variantes') as any).delete().eq('id', id)
  if (error) throw new Error(error.message)

  if (v) revalidatePath(`/admin/productos/${v.producto_id}`)
}
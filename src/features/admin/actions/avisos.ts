'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '../services/supabase-admin'
import { requirePermissionAction } from '../utils/auth-server'

export async function marcarAvisoContactado(avisoId: string) {
  await requirePermissionAction('edit_products')
  const supabase = getSupabaseAdmin()

  const { data: aviso } = await (supabase
    .from('avisos_stock')
    .select('producto_id')
    .eq('id', avisoId)
    .single() as any)

  const { error } = await (supabase
    .from('avisos_stock') as any)
    .update({ contactado_at: new Date().toISOString() })
    .eq('id', avisoId)

  if (error) throw new Error(error.message)

  if (aviso?.producto_id) revalidatePath(`/admin/productos/${aviso.producto_id}`)
}
'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '../services/supabase-admin'
import { requirePermissionAction } from '../utils/auth-server'

export async function actualizarRolUsuario(userId: string, rol: string) {
  await requirePermissionAction('manage_users')
  const supabase = getSupabaseAdmin()

  const { error } = await (supabase.from('perfiles') as any)
    .update({ rol })
    .eq('id', userId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/usuarios')
}

export async function eliminarUsuario(userId: string) {
  await requirePermissionAction('manage_users')
  const supabase = getSupabaseAdmin()

  const { error } = await supabase.auth.admin.deleteUser(userId)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/usuarios')
}

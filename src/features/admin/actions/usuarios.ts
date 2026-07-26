'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '../services/supabase-admin'

export async function actualizarRolUsuario(userId: string, rol: string) {
  const supabase = getSupabaseAdmin()

  const { error } = await (supabase.from('perfiles') as any)
    .update({ rol })
    .eq('id', userId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/usuarios')
}

export async function eliminarUsuario(userId: string) {
  const supabase = getSupabaseAdmin()

  const { error } = await supabase.auth.admin.deleteUser(userId)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/usuarios')
}

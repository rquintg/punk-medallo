'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function actualizarPerfil(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const nombre = formData.get('nombre') as string
  const imagen = formData.get('imagen') as File | null

  let avatar_url: string | null = null

  if (imagen && imagen.size > 0) {
    if (!imagen.type.startsWith('image/')) {
      throw new Error('Solo se permiten archivos de imagen')
    }
    const AVATAR_MAX_BYTES = 10 * 1024 * 1024
    if (imagen.size > AVATAR_MAX_BYTES) {
      throw new Error('La imagen no puede superar 10 MB')
    }
    const ext = (imagen.name.split('.').pop() ?? '').toLowerCase()
    if (!['png', 'jpg', 'jpeg', 'webp', 'avif'].includes(ext)) {
      throw new Error('Formato no permitido. Usa PNG, JPG, WEBP o AVIF')
    }
    const path = `avatars/${user.id}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('productos')
      .upload(path, imagen, { upsert: true })

    if (uploadError) throw new Error(uploadError.message)

    const { data: { publicUrl } } = supabase.storage
      .from('productos')
      .getPublicUrl(path)

    avatar_url = publicUrl
  }

  const updates: Record<string, string | null> = {
    nombre,
  }
  if (avatar_url) updates.avatar_url = avatar_url

  const { error } = await supabase
    .from('perfiles')
    .update(updates)
    .eq('id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/perfil')
  redirect('/admin/perfil')
}

'use server'

import { revalidatePath } from 'next/cache'
import { getRolActual, getUsuarioActual, requirePermissionAction } from '@/features/admin/utils/auth-server'
import { getSupabaseAdmin } from '@/features/admin/services/supabase-admin'

async function assertOwnerEvento(eventoId: string) {
  const rol = await getRolActual()
  if (rol !== 'publicador') return
  const usuario = await getUsuarioActual()
  if (!usuario) throw new Error('No autenticado')
  const supabase = getSupabaseAdmin()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client sin Database generic (patrón tienda: as unknown as)
  const { data } = await (supabase.from('eventos_boletos') as any).select('owner_id').eq('id', eventoId).maybeSingle()
  if (!data || data.owner_id !== usuario.id) throw new Error('No tienes permiso para modificar este evento')
}

async function assertOwnerTipo(tipoId: string) {
  const rol = await getRolActual()
  if (rol !== 'publicador') return
  const supabase = getSupabaseAdmin()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client sin Database generic (patrón tienda: as unknown as)
  const { data } = await (supabase.from('tipos_boleta') as any).select('evento_id').eq('id', tipoId).maybeSingle()
  if (!data) throw new Error('Tipo no encontrado')
  await assertOwnerEvento(data.evento_id)
}
import {
  createEvento,
  updateEvento,
  desactivarEvento,
  createTipo,
  updateTipo,
  deleteTipo,
} from './services/admin'

function genSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function revalidate(): void {
  revalidatePath('/boletas', 'layout')
  revalidatePath('/admin/boletos')
}

// ---------- Evento ----------

export async function crearEventoAction(formData: FormData): Promise<{ id: string }> {
  const rol = await requirePermissionAction('manage_boleteria')

  const titulo = (formData.get('titulo') as string)?.trim() ?? ''
  const lugar = (formData.get('lugar') as string)?.trim() ?? ''
  const fecha = formData.get('fechaEvento') as string

  if (!titulo || !lugar || !fecha) throw new Error('Título, lugar y fecha son obligatorios')

  const ownerId = rol === 'publicador' ? (await getUsuarioActual())?.id ?? null : null
  const id = await createEvento({
    slug: genSlug(titulo),
    titulo,
    descripcion: (formData.get('descripcion') as string)?.trim() || null,
    lugar,
    fechaEvento: new Date(fecha).toISOString(),
    horaPuertas: (formData.get('horaPuertas') as string)?.trim() || null,
    edadMinima: formData.get('edadMinima') ? Number(formData.get('edadMinima')) : null,
    imagenUrl: null,
    imagenCardUrl: null,
    activo: true,
  }, ownerId)

  revalidate()
  return { id }
}

export async function actualizarEventoAction(id: string, formData: FormData): Promise<void> {
  await requirePermissionAction('manage_boleteria')
  await assertOwnerEvento(id)

  const titulo = (formData.get('titulo') as string)?.trim() ?? ''
  const lugar = (formData.get('lugar') as string)?.trim() ?? ''
  const fecha = formData.get('fechaEvento') as string

  if (!titulo || !lugar || !fecha) throw new Error('Título, lugar y fecha son obligatorios')

  await updateEvento(id, {
    slug: genSlug(titulo),
    titulo,
    descripcion: (formData.get('descripcion') as string)?.trim() || null,
    lugar,
    fechaEvento: new Date(fecha).toISOString(),
    horaPuertas: (formData.get('horaPuertas') as string)?.trim() || null,
    edadMinima: formData.get('edadMinima') ? Number(formData.get('edadMinima')) : null,
  })

  revalidate()
}

export async function desactivarEventoAction(id: string): Promise<void> {
  await requirePermissionAction('manage_boleteria')
  await assertOwnerEvento(id)
  await desactivarEvento(id)
  revalidate()
}

/** Sube la portada del evento al bucket y la guarda como imagen_url */
export async function subirImagenEventoAction(eventoId: string, slug: string, formData: FormData): Promise<{ url: string }> {
  await requirePermissionAction('manage_boleteria')
  await assertOwnerEvento(eventoId)
  const supabase = getSupabaseAdmin()

  const file = formData.get('file') as File | null
  if (!file || file.size === 0) throw new Error('Archivo requerido')
  if (!file.type.startsWith('image/')) throw new Error('Solo se permiten archivos de imagen')
  if (file.size > 10 * 1024 * 1024) throw new Error('La imagen no puede superar 10 MB')

  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ext || !['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
    throw new Error('Formato no permitido. Usa PNG, JPG o WebP')
  }

  const path = `eventos/${slug}/${crypto.randomUUID()}.${ext}`
  const { error: uploadError } = await supabase.storage.from('productos').upload(path, file, {
    contentType: file.type,
  })
  if (uploadError) throw new Error(uploadError.message)

  const { data: { publicUrl } } = supabase.storage.from('productos').getPublicUrl(path)
  await updateEvento(eventoId, { imagenUrl: publicUrl })

  revalidate()
  return { url: publicUrl }
}

/** Sube la imagen cuadrada de la card (1:1) y la guarda como imagen_card_url */
export async function subirImagenCardEventoAction(
  eventoId: string,
  slug: string,
  formData: FormData,
): Promise<{ url: string }> {
  await requirePermissionAction('manage_boleteria')
  await assertOwnerEvento(eventoId)
  const supabase = getSupabaseAdmin()

  const file = formData.get('file') as File | null
  if (!file || file.size === 0) throw new Error('Archivo requerido')
  if (!file.type.startsWith('image/')) throw new Error('Solo se permiten archivos de imagen')
  if (file.size > 10 * 1024 * 1024) throw new Error('La imagen no puede superar 10 MB')

  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ext || !['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
    throw new Error('Formato no permitido. Usa PNG, JPG o WebP')
  }

  const path = `eventos/${slug}/card-${crypto.randomUUID()}.${ext}`
  const { error: uploadError } = await supabase.storage.from('productos').upload(path, file, {
    contentType: file.type,
  })
  if (uploadError) throw new Error(uploadError.message)

  const { data: { publicUrl } } = supabase.storage.from('productos').getPublicUrl(path)
  await updateEvento(eventoId, { imagenCardUrl: publicUrl })

  revalidate()
  return { url: publicUrl }
}

// ---------- Tipos de boleta ----------

export async function agregarTipoAction(eventoId: string, formData: FormData): Promise<void> {
  await requirePermissionAction('manage_boleteria')
  await assertOwnerEvento(eventoId)

  const nombre = (formData.get('nombre') as string)?.trim() ?? ''
  const precio = Number(formData.get('precio'))
  const cantidadTotal = Number(formData.get('cantidadTotal'))

  if (!nombre) throw new Error('Nombre requerido')
  if (!Number.isFinite(precio) || precio <= 0) throw new Error('Precio inválido')
  if (!Number.isInteger(cantidadTotal) || cantidadTotal <= 0) throw new Error('Cantidad inválida')

  await createTipo(eventoId, { nombre, precio: Math.round(precio), cantidadTotal })
  revalidate()
}

export async function actualizarTipoAction(tipoId: string, formData: FormData): Promise<void> {
  await requirePermissionAction('manage_boleteria')
  await assertOwnerTipo(tipoId)

  const payload: { nombre?: string; precio?: number; cantidadTotal?: number } = {}
  const nombre = formData.get('nombre')
  const precio = formData.get('precio')
  const cantidad = formData.get('cantidadTotal')

  if (nombre !== null) payload.nombre = String(nombre).trim()
  if (precio !== null) {
    const p = Number(precio)
    if (!Number.isFinite(p) || p <= 0) throw new Error('Precio inválido')
    payload.precio = Math.round(p)
  }
  if (cantidad !== null) {
    const c = Number(cantidad)
    if (!Number.isInteger(c) || c <= 0) throw new Error('Cantidad inválida')
    payload.cantidadTotal = c
  }

  await updateTipo(tipoId, payload)
  revalidate()
}

export async function eliminarTipoAction(tipoId: string): Promise<void> {
  await requirePermissionAction('manage_boleteria')
  await assertOwnerTipo(tipoId)
  await deleteTipo(tipoId)
  revalidate()
}

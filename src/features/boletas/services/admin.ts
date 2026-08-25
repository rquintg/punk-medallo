import { getSupabaseAdmin } from '@/features/admin/services/supabase-admin'
import type { EventoBoleto, TipoBoleta } from '../types'

/**
 * Servicios ADMIN de boletería (CRUD eventos + tipos).
 * Todas las escrituras van con service role (RLS solo permite lectura pública).
 */

interface DbEvento {
  id: string
  slug: string
  titulo: string
  descripcion: string | null
  lugar: string
  fecha_evento: string
  hora_puertas: string | null
  edad_minima: number | null
  imagen_url: string | null
  activo: boolean
}

/** Fila cruda de BD (snake_case) */
interface DbTipo {
  id: string
  evento_id: string
  nombre: string
  precio: number
  cantidad_total: number
  orden: number
  activo: boolean
}

function mapTipo(row: DbTipo): TipoBoleta {
  return {
    id: row.id,
    eventoId: row.evento_id,
    nombre: row.nombre,
    precio: row.precio,
    cantidadTotal: row.cantidad_total,
    orden: row.orden,
    activo: row.activo,
  }
}

function mapEvento(row: DbEvento): EventoBoleto {
  return {
    id: row.id,
    slug: row.slug,
    titulo: row.titulo,
    descripcion: row.descripcion,
    lugar: row.lugar,
    fechaEvento: row.fecha_evento,
    horaPuertas: row.hora_puertas,
    edadMinima: row.edad_minima,
    imagenUrl: row.imagen_url,
    activo: row.activo,
  }
}

/** Conteo de boletas por estado — vendidas (valida+usada) y usadas (escaneadas) */
async function contarBoletasPorEvento(
  eventoId: string,
): Promise<{ vendidas: Map<string, number>; usadas: Map<string, number> }> {
  const supabase = getSupabaseAdmin()
  const { data } = await (supabase.from('boletas') as any)
    .select('tipo_id, estado')
    .eq('evento_id', eventoId)
    .neq('estado', 'anulada')

  const vendidas = new Map<string, number>()
  const usadas = new Map<string, number>()
  for (const b of (data ?? []) as { tipo_id: string; estado: string }[]) {
    vendidas.set(b.tipo_id, (vendidas.get(b.tipo_id) ?? 0) + 1)
    if (b.estado === 'usada') {
      usadas.set(b.tipo_id, (usadas.get(b.tipo_id) ?? 0) + 1)
    }
  }
  return { vendidas, usadas }
}

function conDisponibilidad(
  tipos: DbTipo[],
  conteo: { vendidas: Map<string, number>; usadas: Map<string, number> },
): TipoBoleta[] {
  return tipos.map((t) => {
    const v = conteo.vendidas.get(t.id) ?? 0
    return {
      ...mapTipo(t),
      vendidas: v,
      disponibles: Math.max(0, t.cantidad_total - v),
      usadas: conteo.usadas.get(t.id) ?? 0,
    }
  })
}

export async function getEventosAdmin(): Promise<(EventoBoleto & { totalTipos: number })[]> {
  const supabase = getSupabaseAdmin()
  const [eventosRes, tiposRes] = await Promise.all([
    (supabase.from('eventos_boletos') as any)
      .select('*')
      .order('fecha_evento', { ascending: false }),
    (supabase.from('tipos_boleta') as any).select('evento_id, cantidad_total'),
  ])

  const eventos = ((eventosRes.data ?? []) as DbEvento[]).map(mapEvento)
  const tipos = (tiposRes.data ?? []) as { evento_id: string; cantidad_total: number }[]

  const porEvento = new Map<string, number>()
  for (const t of tipos) porEvento.set(t.evento_id, (porEvento.get(t.evento_id) ?? 0) + t.cantidad_total)

  return eventos.map((e) => ({ ...e, totalTipos: porEvento.get(e.id) ?? 0 }))
}

export async function getEventoAdminById(id: string): Promise<{
  evento: EventoBoleto
  tipos: TipoBoleta[]
} | null> {
  const supabase = getSupabaseAdmin()
  const { data } = await (supabase.from('eventos_boletos') as any).select('*').eq('id', id).maybeSingle()
  if (!data) return null

  const [tiposRes, vendidas] = await Promise.all([
    (supabase.from('tipos_boleta') as any).select('*').eq('evento_id', id).order('orden'),
    contarBoletasPorEvento(id),
  ])

  return {
    evento: mapEvento(data as DbEvento),
    tipos: conDisponibilidad((tiposRes.data ?? []) as DbTipo[], vendidas),
  }
}

export interface EventoInput {
  slug: string
  titulo: string
  descripcion: string | null
  lugar: string
  fechaEvento: string // ISO
  horaPuertas: string | null
  edadMinima: number | null
  imagenUrl: string | null
  activo: boolean
}

export async function createEvento(input: EventoInput): Promise<string> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await (supabase.from('eventos_boletos') as any)
    .insert({
      slug: input.slug,
      titulo: input.titulo,
      descripcion: input.descripcion,
      lugar: input.lugar,
      fecha_evento: input.fechaEvento,
      hora_puertas: input.horaPuertas,
      edad_minima: input.edadMinima,
      imagen_url: input.imagenUrl,
      activo: input.activo,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  revalidateBoletas()
  return data.id as string
}

export async function updateEvento(id: string, input: Partial<EventoInput>): Promise<void> {
  const supabase = getSupabaseAdmin()
  const payload: Record<string, unknown> = {}
  if (input.slug !== undefined) payload.slug = input.slug
  if (input.titulo !== undefined) payload.titulo = input.titulo
  if (input.descripcion !== undefined) payload.descripcion = input.descripcion
  if (input.lugar !== undefined) payload.lugar = input.lugar
  if (input.fechaEvento !== undefined) payload.fecha_evento = input.fechaEvento
  if (input.horaPuertas !== undefined) payload.hora_puertas = input.horaPuertas
  if (input.edadMinima !== undefined) payload.edad_minima = input.edadMinima
  if (input.imagenUrl !== undefined) payload.imagen_url = input.imagenUrl
  if (input.activo !== undefined) payload.activo = input.activo

  const { error } = await (supabase.from('eventos_boletos') as any).update(payload).eq('id', id)
  if (error) throw new Error(error.message)
  revalidateBoletas()
}

/** Soft delete: nunca se borra un evento con ventas (historial de boletas) */
export async function desactivarEvento(id: string): Promise<void> {
  const supabase = getSupabaseAdmin()
  const { error } = await (supabase.from('eventos_boletos') as any).update({ activo: false }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidateBoletas()
}

// ---------- Tipos de boleta ----------

export async function createTipo(eventoId: string, input: { nombre: string; precio: number; cantidadTotal: number }): Promise<void> {
  const supabase = getSupabaseAdmin()
  const { data: maxOrden } = await (supabase.from('tipos_boleta') as any)
    .select('orden')
    .eq('evento_id', eventoId)
    .order('orden', { ascending: false })
    .limit(1)

  const { error } = await (supabase.from('tipos_boleta') as any).insert({
    evento_id: eventoId,
    nombre: input.nombre,
    precio: input.precio,
    cantidad_total: input.cantidadTotal,
    orden: (maxOrden?.[0]?.orden ?? -1) + 1,
    activo: true,
  })
  if (error) throw new Error(error.message)
  revalidateBoletas()
}

export async function updateTipo(
  id: string,
  input: { nombre?: string; precio?: number; cantidadTotal?: number },
): Promise<void> {
  const supabase = getSupabaseAdmin()
  const { data: actual } = await (supabase.from('tipos_boleta') as any)
    .select('cantidad_total, evento_id')
    .eq('id', id)
    .single()
  if (!actual) throw new Error('Tipo no encontrado')

  // Regla: no se puede bajar el cupo por debajo de las ya vendidas
  if (input.cantidadTotal !== undefined && input.cantidadTotal < actual.cantidad_total) {
    const vendidas = (await contarBoletasPorEvento(actual.evento_id)).vendidas.get(id) ?? 0
    if (input.cantidadTotal < vendidas) {
      throw new Error(`Ya hay ${vendidas} boletas vendidas: no puedes bajar el cupo a ${input.cantidadTotal}`)
    }
  }

  const payload: Record<string, unknown> = {}
  if (input.nombre !== undefined) payload.nombre = input.nombre
  if (input.precio !== undefined) payload.precio = input.precio
  if (input.cantidadTotal !== undefined) payload.cantidad_total = input.cantidadTotal

  const { error } = await (supabase.from('tipos_boleta') as any).update(payload).eq('id', id)
  if (error) throw new Error(error.message)
  revalidateBoletas()
}

/** Solo permite eliminar si tiene 0 ventas; si no, desactivar */
export async function deleteTipo(id: string): Promise<void> {
  const supabase = getSupabaseAdmin()
  const { data: actual } = await (supabase.from('tipos_boleta') as any)
    .select('evento_id, activo')
    .eq('id', id)
    .single()
  if (!actual) return

  const vendidas = (await contarBoletasPorEvento(actual.evento_id)).vendidas.get(id) ?? 0
  if (vendidas > 0) {
    throw new Error(`No puedes eliminarlo: tiene ${vendidas} boletas vendidas. Desactívalo.`)
  }

  const { error } = await (supabase.from('tipos_boleta') as any).delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidateBoletas()
}

function revalidateBoletas(): void {
  // import dinámico para no acoplar este módulo server-only al bundle del cliente
  void import('next/cache').then(({ revalidatePath }) => {
    revalidatePath('/boletas', 'layout')
    revalidatePath('/admin/boletos')
  })
}

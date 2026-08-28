import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/features/admin/services/supabase-admin'
import type { EventoBoleto, TipoBoleta } from '../types'
import { MAX_BOLETAS_POR_PERSONA } from '../types'

/**
 * Servicios PÚBLICOS de boletería (lectura + disponibilidad).
 * Lectura con cliente anon (RLS permite SELECT de eventos/tipos).
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
  imagen_card_url: string | null
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
    imagenCardUrl: row.imagen_card_url,
    activo: true,
  }
}

/** Fila cruda de BD (snake_case) */
interface DbTipoRow {
  id: string
  evento_id: string
  nombre: string
  precio: number
  cantidad_total: number
  orden: number
  activo: boolean
}

function mapTipoPublico(row: DbTipoRow, vendidas: number): TipoPublico {
  return {
    id: row.id,
    eventoId: row.evento_id,
    nombre: row.nombre,
    precio: row.precio,
    cantidadTotal: row.cantidad_total,
    orden: row.orden,
    activo: row.activo,
    vendidas,
    disponibles: Math.max(0, row.cantidad_total - vendidas),
  }
}

export interface TipoPublico extends TipoBoleta {
  vendidas: number
  disponibles: number
}

export interface EventoConTipos extends EventoBoleto {
  tipos: TipoPublico[]
  totalBoletas: number
}

/** Disponibilidad real por tipo = cantidad_total − COUNT(boletas no anuladas) */
async function vendidasPorTipo(
  eventoIds: string[],
): Promise<Map<string, Map<string, number>>> {
  if (eventoIds.length === 0) return new Map()
  const supabaseAdmin = getSupabaseAdmin()
  const { data } = await (supabaseAdmin.from('boletas') as any)
    .select('evento_id, tipo_id')
    .in('evento_id', eventoIds)
    .neq('estado', 'anulada')

  const porEvento = new Map<string, Map<string, number>>()
  for (const b of (data ?? []) as { evento_id: string; tipo_id: string }[]) {
    const tipos = porEvento.get(b.evento_id) ?? new Map<string, number>()
    tipos.set(b.tipo_id, (tipos.get(b.tipo_id) ?? 0) + 1)
    porEvento.set(b.evento_id, tipos)
  }
  return porEvento
}

/** Listado público: eventos activos con fecha futura */
export async function listarEventosActivos(): Promise<EventoConTipos[]> {
  const supabase = await createClient()
  const ahoraIso = new Date().toISOString()

  const [eventosRes, tiposRes] = await Promise.all([
    (supabase.from('eventos_boletos') as any)
      .select('*')
      .eq('activo', true)
      .gte('fecha_evento', ahoraIso)
      .order('fecha_evento', { ascending: true }),
    (supabase.from('tipos_boleta') as any)
      .select('*')
      .eq('activo', true)
      .order('orden'),
  ])

  const eventos = ((eventosRes.data ?? []) as DbEvento[]).map(mapEvento)
  if (eventos.length === 0) return []

  const todosTipos = (tiposRes.data ?? []) as DbTipoRow[]
  const vendidas = await vendidasPorTipo(eventos.map((e) => e.id))

  return eventos
    .map((e) => {
      const tipos: TipoPublico[] = todosTipos
        .filter((t) => t.evento_id === e.id)
        .map((t) => mapTipoPublico(t, vendidas.get(e.id)?.get(t.id) ?? 0))
      return {
        ...e,
        tipos,
        totalBoletas: tipos.reduce((s, t) => s + t.cantidadTotal, 0),
      }
    })
    .filter((e) => e.tipos.length > 0)
}

export async function getEventoPublicoBySlug(slug: string): Promise<EventoConTipos | null> {
  const supabase = await createClient()
  const ahoraIso = new Date().toISOString()

  const { data } = await (supabase.from('eventos_boletos') as any)
    .select('*')
    .eq('slug', slug)
    .eq('activo', true)
    .gte('fecha_evento', ahoraIso)
    .maybeSingle()
  if (!data) return null

  const evento = mapEvento(data as DbEvento)
  const [tiposRes, vendidas] = await Promise.all([
    (supabase.from('tipos_boleta') as any).select('*').eq('evento_id', evento.id).eq('activo', true).order('orden'),
    vendidasPorTipo([evento.id]),
  ])

  const tipos: TipoPublico[] = ((tiposRes.data ?? []) as DbTipoRow[])
    .filter((t) => t.evento_id === evento.id)
    .map((t) => mapTipoPublico(t, vendidas.get(evento.id)?.get(t.id) ?? 0))

  return {
    ...evento,
    tipos,
    totalBoletas: tipos.reduce((s, t) => s + t.cantidadTotal, 0),
  }
}

/**
 * Boletas ya compradas por un usuario en un evento (todas menos anuladas).
 * Para el límite anti-revendedores: compradas + nuevas <= MAX_BOLETAS_POR_PERSONA.
 */
export async function contarCompradasPorUsuario(
  usuarioId: string,
  eventoId: string,
): Promise<number> {
  const supabaseAdmin = getSupabaseAdmin()
  const { count } = await (supabaseAdmin.from('boletas') as any)
    .select('id', { count: 'exact', head: true })
    .eq('usuario_id', usuarioId)
    .eq('evento_id', eventoId)
    .neq('estado', 'anulada')

  return count ?? 0
}

/** Máximo comprable ahora mismo por tipo para este usuario + conteo global */
export interface MaximoComprableResult {
  maximos: Record<string, number>
  ya: number
  restante: number
}
export async function maximoComprable(
  usuarioId: string,
  evento: EventoConTipos,
): Promise<MaximoComprableResult> {
  const ya = await contarCompradasPorUsuario(usuarioId, evento.id)
  const restante = Math.max(0, MAX_BOLETAS_POR_PERSONA - ya)

  const maximos: Record<string, number> = {}
  for (const t of evento.tipos) {
    maximos[t.id] = Math.min(restante, t.disponibles)
  }
  return { maximos, ya, restante }
}

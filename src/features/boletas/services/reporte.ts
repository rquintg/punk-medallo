import { getSupabaseAdmin } from '@/features/admin/services/supabase-admin'

export interface BoletaReporteRow {
  id: string
  codigo: string
  estado: string
  tipoId: string
  tipoNombre: string
  titularNombre: string
  titularEmail: string
  pedidoId: string
  numeroPedido: string | null
  createdAt: string
  escaneadaEn: string | null
  escaneadaPorId: string | null
  escaneadaPorEmail: string | null
}

export interface BoletasReporteParams {
  eventoId: string
  page?: number
  pageSize?: number
  estado?: string
  q?: string
}

export interface BoletasReporteResult {
  rows: BoletaReporteRow[]
  total: number
  resumen: {
    totalBoletas: number
    validas: number
    usadas: number
    anuladas: number
    cupo: number
  }
}

const PAGE_SIZE_DEFAULT = 50

function bogotaFormatter(): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

export function formatearBogota(iso: string | null): string {
  if (!iso) return '-'
  try {
    return bogotaFormatter().format(new Date(iso))
  } catch {
    return iso ?? '-'
  }
}

export async function getBoletasPorEvento(params: BoletasReporteParams & { ownerId?: string | null }): Promise<BoletasReporteResult> {
  const { eventoId, page = 1, pageSize = PAGE_SIZE_DEFAULT, estado, q, ownerId } = params as BoletasReporteParams & { ownerId?: string | null }
  const supabase = getSupabaseAdmin()
  if (ownerId) {
    // verifica que el evento pertenezca al publicador
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client sin Database generic (patrón tienda: as unknown as)
    const { data: ev } = await (supabase.from('eventos_boletos') as any).select('owner_id').eq('id', eventoId).maybeSingle()
    if (!ev || (ev as { owner_id: string | null }).owner_id !== ownerId) {
      return { rows: [], total: 0, resumen: { totalBoletas: 0, validas: 0, usadas: 0, anuladas: 0, cupo: 0 } }
    }
  }
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // resumen cupo desde tipos_boleta
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client sin Database generic (patrón tienda: as unknown as)
  const { data: tipos } = await (supabase.from('tipos_boleta') as any)
    .select('id, nombre, cantidad_total')
    .eq('evento_id', eventoId)

  const tiposMap = new Map<string, { nombre: string; cantidad: number }>()
  let cupo = 0
  for (const t of (tipos ?? []) as { id: string; nombre: string; cantidad_total: number }[]) {
    tiposMap.set(t.id, { nombre: t.nombre, cantidad: t.cantidad_total })
    cupo += t.cantidad_total
  }

  // boletas con filtros
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client sin Database generic (patrón tienda: as unknown as)
  let query = (supabase.from('boletas') as any)
    .select('id, codigo, estado, tipo_id, titular_nombre, titular_email, pedido_id, created_at, escaneada_en, escaneada_por, pedidos(numero_pedido)', { count: 'exact' })
    .eq('evento_id', eventoId)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (estado && estado !== 'todos') query = query.eq('estado', estado)
  if (q && q.trim()) {
    const term = q.trim()
    // busca por codigo o titular o email
    query = query.or(`codigo.ilike.%${term}%,titular_nombre.ilike.%${term}%,titular_email.ilike.%${term}%`)
  }

  const { data, count, error } = await query
  if (error) throw new Error(error.message)

  const rowsRaw = (data ?? []) as Array<{
    id: string
    codigo: string
    estado: string
    tipo_id: string
    titular_nombre: string
    titular_email: string
    pedido_id: string
    created_at: string
    escaneada_en: string | null
    escaneada_por: string | null
    pedidos: { numero_pedido: string } | null
  }>

  // mapeo scanner email via auth.admin.listUsers (batch)
  const scannerIds = [...new Set(rowsRaw.map((r) => r.escaneada_por).filter(Boolean) as string[])]
  const scannerEmailMap = new Map<string, string>()
  if (scannerIds.length > 0) {
    try {
      const { data: auth } = await supabase.auth.admin.listUsers({ page: 1, perPage: 10000 })
      for (const u of auth?.users ?? []) if (scannerIds.includes(u.id)) scannerEmailMap.set(u.id, u.email ?? '')
    } catch {}
    // fallback: si no hay acceso, usar id corto
  }

  const rows: BoletaReporteRow[] = rowsRaw.map((r) => ({
    id: r.id,
    codigo: r.codigo,
    estado: r.estado,
    tipoId: r.tipo_id,
    tipoNombre: tiposMap.get(r.tipo_id)?.nombre ?? r.tipo_id,
    titularNombre: r.titular_nombre,
    titularEmail: r.titular_email,
    pedidoId: r.pedido_id,
    numeroPedido: r.pedidos?.numero_pedido ?? null,
    createdAt: r.created_at,
    escaneadaEn: r.escaneada_en,
    escaneadaPorId: r.escaneada_por,
    escaneadaPorEmail: r.escaneada_por ? (scannerEmailMap.get(r.escaneada_por) ?? r.escaneada_por) : null,
  }))

  // resumen total (sin paginacion) — 3 counts ligeros
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client sin Database generic (patrón tienda: as unknown as)
  const { count: totalCount } = await (supabase.from('boletas') as any)
    .select('id', { count: 'exact', head: true })
    .eq('evento_id', eventoId)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client sin Database generic (patrón tienda: as unknown as)
  const { count: usadasCount } = await (supabase.from('boletas') as any)
    .select('id', { count: 'exact', head: true })
    .eq('evento_id', eventoId)
    .eq('estado', 'usada')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client sin Database generic (patrón tienda: as unknown as)
  const { count: validasCount } = await (supabase.from('boletas') as any)
    .select('id', { count: 'exact', head: true })
    .eq('evento_id', eventoId)
    .eq('estado', 'valida')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client sin Database generic (patrón tienda: as unknown as)
  const { count: anuladasCount } = await (supabase.from('boletas') as any)
    .select('id', { count: 'exact', head: true })
    .eq('evento_id', eventoId)
    .eq('estado', 'anulada')

  return {
    rows,
    total: count ?? 0,
    resumen: {
      totalBoletas: totalCount ?? 0,
      validas: validasCount ?? 0,
      usadas: usadasCount ?? 0,
      anuladas: anuladasCount ?? 0,
      cupo,
    },
  }
}

export async function getEventosParaReporte(ownerId?: string | null): Promise<Array<{ id: string; titulo: string; fechaEvento: string; lugar: string }>> {
  const supabase = getSupabaseAdmin()
  let query = (supabase.from('eventos_boletos') as any).select('id, titulo, fecha_evento, lugar').order('fecha_evento', { ascending: false })
  if (ownerId) query = query.eq('owner_id', ownerId)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client sin Database generic (patrón tienda: as unknown as)
  const { data } = await query
  return ((data ?? []) as Array<{ id: string; titulo: string; fecha_evento: string; lugar: string }>).map((r) => ({
    id: r.id,
    titulo: r.titulo,
    fechaEvento: r.fecha_evento,
    lugar: r.lugar,
  }))
}

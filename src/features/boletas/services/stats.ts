import { getSupabaseAdmin } from '@/features/admin/services/supabase-admin'

export interface BoleteriaStatsEvento {
  eventoId: string
  slug: string
  titulo: string
  fechaEvento: string
  activo: boolean
  totalCupo: number
  vendidas: number
  usadas: number
  ingresos: number | null
}

/**
 * Métricas de boletería por evento (T7):
 * cupo, vendidas (valida+usada), usadas (escaneadas) e ingresos estimados
 * (precio del tipo × vendidas, desde pedido_items reales).
 */
export async function getBoleteriaStats(): Promise<BoleteriaStatsEvento[]> {
  const admin = getSupabaseAdmin()

  // Eventos con sus tipos y cupos
  const [{ data: eventos }, { data: tipos }, { data: boletas }, { data: items }] = await Promise.all([
    (admin.from('eventos_boletos') as any)
      .select('id, slug, titulo, fecha_evento, activo')
      .order('fecha_evento', { ascending: false })
      .limit(20),
    (admin.from('tipos_boleta') as any).select('id, evento_id, precio, cantidad_total'),
    (admin.from('boletas') as any).select('tipo_id, evento_id, estado'),
    (admin.from('pedido_items') as any).select('tipo_boleta_id, precio, cantidad').not('tipo_boleta_id', 'is', null),
  ])

  if (!eventos || eventos.length === 0) return []

  const tipoPorId = new Map<string, { evento_id: string; precio: number; cantidad_total: number }>()
  for (const t of tipos ?? []) tipoPorId.set(t.id, t)

  const stats = new Map<
    string,
    { vendidas: Set<string>; usadas: number; ingresos: number; cupo: number }
  >()

  const ensure = (eventoId: string) => {
    let s = stats.get(eventoId)
    if (!s) {
      s = { vendidas: new Set(), usadas: 0, ingresos: 0, cupo: 0 }
      stats.set(eventoId, s)
    }
    return s
  }

  // Cupo total por evento = suma cantidad_total de sus tipos
  for (const t of tipos ?? []) {
    ensure(t.evento_id).cupo += t.cantidad_total
  }

  // Boletas: vendidas (valida+usada) por id de boleta; usadas aparte
  for (const b of boletas ?? []) {
    const s = ensure(b.evento_id)
    s.vendidas.add(b.id)
    if (b.estado === 'usada') s.usadas += 1
  }

  // Ingresos reales desde pedido_items (precio × cantidad por tipo)
  const ingresoPorTipo = new Map<string, number>()
  for (const it of items ?? []) {
    if (!it.tipo_boleta_id) continue
    ingresoPorTipo.set(
      it.tipo_boleta_id,
      (ingresoPorTipo.get(it.tipo_boleta_id) ?? 0) + (it.precio ?? 0) * (it.cantidad ?? 0),
    )
  }
  for (const [tipoId, monto] of ingresoPorTipo) {
    const tipo = tipoPorId.get(tipoId)
    if (tipo) ensure(tipo.evento_id).ingresos += monto
  }

  return eventos.map((e: any) => {
    const s = stats.get(e.id) ?? { vendidas: new Set(), usadas: 0, ingresos: 0, cupo: 0 }
    return {
      eventoId: e.id,
      slug: e.slug,
      titulo: e.titulo,
      fechaEvento: e.fecha_evento,
      activo: e.activo,
      totalCupo: s.cupo,
      vendidas: s.vendidas.size,
      usadas: s.usadas,
      ingresos: s.ingresos,
    }
  })
}

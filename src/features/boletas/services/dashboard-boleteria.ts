import { getSupabaseAdmin } from '@/features/admin/services/supabase-admin'
import type { RangoDias } from '@/features/admin/services/dashboard'
import { ESTADOS_VALIDOS } from '@/features/admin/services/dashboard'

export interface SerieBoleteria {
  fecha: string
  etiqueta: string
  ingresos: number
  boletas: number
}

export interface TopEvento {
  titulo: string
  eventoId: string
  cantidad: number
  ingresos: number
}

export interface BoleteriaAnalytics {
  rango: RangoDias
  totalIngresos: number
  deltaIngresos: number | null
  totalBoletas: number
  deltaBoletas: number | null
  ticketPromedio: number
  deltaTicket: number | null
  tasaOcupacion: number
  serie: SerieBoleteria[]
  topEventos: TopEvento[]
  porEvento: { nombre: string; ingresos: number }[]
  porEstado: { estado: string; count: number }[]
  ultimasBoletas: { codigo: string; evento: string; tipo: string; estado: string; created_at: string; titular: string }[]
  totalCupo: number
  validas: number
  usadas: number
  anuladas: number
  porEscanear: number
  eventosActivos: number
}

function inicioDiaBogota(offsetDias = 0): string {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' })
  const d = new Date(Date.now() - offsetDias * 86400000)
  return `${fmt.format(d)}T05:00:00.000Z`
}
function claveDia(iso: string): string {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' })
  return fmt.format(new Date(iso))
}
function deltaPct(a: number, b: number): number | null {
  if (b <= 0) return null
  return Math.round(((a - b) / b) * 1000) / 10
}
function ingresoDeBoleteria(pedido: { total: number | null; estado: string }): number {
  return ESTADOS_VALIDOS.includes(pedido.estado) ? (pedido.total ?? 0) : 0
}

export async function getDashboardBoleteriaAnalytics(rango: RangoDias): Promise<BoleteriaAnalytics> {
  const supabase = getSupabaseAdmin()
  const desde = inicioDiaBogota(rango - 1)
  const desdePrev = inicioDiaBogota(rango - 1 + rango)

  const [boletasRangoRes, boletasPrevRes, boletasTodasRes, tiposRes, eventosRes, pedidoItemsBoleteriaRes, pedidosBoleteriaRes, pedidosPrevRes] =
    await Promise.all([
      (supabase.from('boletas') as any).select('id, evento_id, tipo_id, estado, created_at, escaneada_en').gte('created_at', desde),
      (supabase.from('boletas') as any).select('id').gte('created_at', desdePrev).lt('created_at', desde),
      (supabase.from('boletas') as any).select('id, evento_id, estado'),
      (supabase.from('tipos_boleta') as any).select('id, evento_id, nombre, precio, cantidad_total'),
      (supabase.from('eventos_boletos') as any).select('id, titulo, fecha_evento, activo'),
      (supabase.from('pedido_items') as any)
        .select('pedido_id, tipo_boleta_id, precio, cantidad, pedidos!inner(id, created_at, estado, total)')
        .not('tipo_boleta_id', 'is', null),
      (supabase.from('pedido_items') as any)
        .select('pedido_id, pedidos!inner(id, estado, total, created_at)')
        .not('tipo_boleta_id', 'is', null),
      // previo pedidos ids for delta ingresos
      (supabase.from('pedido_items') as any)
        .select('pedido_id, precio, cantidad, pedidos!inner(id, created_at, estado)')
        .not('tipo_boleta_id', 'is', null),
    ])

  const boletasRango = (boletasRangoRes.data ?? []) as Array<{ id: string; evento_id: string; tipo_id: string; estado: string; created_at: string; escaneada_en: string | null }>
  const boletasPrevCount = ((boletasPrevRes.data ?? []) as unknown[]).length
  const boletasTodas = (boletasTodasRes.data ?? []) as Array<{ id: string; evento_id: string; estado: string }>
  const tipos = (tiposRes.data ?? []) as Array<{ id: string; evento_id: string; nombre: string; precio: number; cantidad_total: number }>
  const eventos = (eventosRes.data ?? []) as Array<{ id: string; titulo: string; fecha_evento: string; activo: boolean }>
  const pedidoItemsAll = (pedidoItemsBoleteriaRes.data ?? []) as Array<{ pedido_id: string; tipo_boleta_id: string; precio: number; cantidad: number; pedidos: { id: string; created_at: string; estado: string; total: number } }>

  const tipoMap = new Map<string, { eventoId: string; nombre: string; precio: number; cantidad: number }>()
  const cupoPorEvento = new Map<string, number>()
  let totalCupo = 0
  for (const t of tipos) {
    tipoMap.set(t.id, { eventoId: t.evento_id, nombre: t.nombre, precio: t.precio, cantidad: t.cantidad_total })
    cupoPorEvento.set(t.evento_id, (cupoPorEvento.get(t.evento_id) ?? 0) + t.cantidad_total)
    totalCupo += t.cantidad_total
  }
  const eventoTitulo = new Map<string, string>()
  for (const e of eventos) eventoTitulo.set(e.id, e.titulo)

  const totalBoletas = boletasRango.length
  const deltaBoletas = deltaPct(totalBoletas, boletasPrevCount)

  // ingresos boleteria en rango (suma de pedido_items filtrados por pedido en rango y estado valido)
  const ingresosPorDia = new Map<string, number>()
  const boletasPorDia = new Map<string, number>()
  for (const b of boletasRango) {
    const d = claveDia(b.created_at)
    boletasPorDia.set(d, (boletasPorDia.get(d) ?? 0) + 1)
  }
  let totalIngresos = 0
  let ingresosPrev = 0
  const porEventoIngresos = new Map<string, number>()
  const topMap = new Map<string, { titulo: string; cantidad: number; ingresos: number; eventoId: string }>()

  for (const item of pedidoItemsAll) {
    const pedido = item.pedidos
    if (!pedido) continue
    const esPrev = new Date(pedido.created_at).getTime() >= new Date(desdePrev).getTime() && new Date(pedido.created_at).getTime() < new Date(desde).getTime()
    const esRango = new Date(pedido.created_at).getTime() >= new Date(desde).getTime()
    const ingreso = (item.precio ?? 0) * (item.cantidad ?? 0)
    if (!ESTADOS_VALIDOS.includes(pedido.estado)) continue
    if (esRango) {
      const d = claveDia(pedido.created_at)
      ingresosPorDia.set(d, (ingresosPorDia.get(d) ?? 0) + ingreso)
      totalIngresos += ingreso
      const tipo = tipoMap.get(item.tipo_boleta_id)
      const titulo = tipo ? (eventoTitulo.get(tipo.eventoId) ?? tipo.nombre) : 'Evento'
      const key = tipo?.eventoId ?? item.tipo_boleta_id
      const cur = topMap.get(key) ?? { titulo, cantidad: 0, ingresos: 0, eventoId: key }
      cur.cantidad += item.cantidad ?? 0
      cur.ingresos += ingreso
      topMap.set(key, cur)
      porEventoIngresos.set(titulo, (porEventoIngresos.get(titulo) ?? 0) + ingreso)
    } else if (esPrev) {
      ingresosPrev += ingreso
    }
  }

  const ticketPromedio = totalBoletas > 0 ? totalIngresos / totalBoletas : 0
  const ticketPrev = boletasPrevCount > 0 ? ingresosPrev / boletasPrevCount : 0

  const serie: SerieBoleteria[] = []
  const etiquetas = new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota', day: 'numeric', month: 'short' })
  for (let i = rango - 1; i >= 0; i--) {
    const dia = inicioDiaBogota(i).slice(0, 10)
    serie.push({
      fecha: dia,
      etiqueta: etiquetas.format(new Date(`${dia}T12:00:00.000Z`)),
      ingresos: ingresosPorDia.get(dia) ?? 0,
      boletas: boletasPorDia.get(dia) ?? 0,
    })
  }

  const topEventos = [...topMap.values()].sort((a, b) => b.ingresos - a.ingresos).slice(0, 6) as TopEvento[]
  const porEvento = [...porEventoIngresos.entries()].map(([nombre, ingresos]) => ({ nombre, ingresos })).sort((a, b) => b.ingresos - a.ingresos)

  const porEstadoMap = new Map<string, number>()
  let validas = 0
  let usadas = 0
  let anuladas = 0
  for (const b of boletasTodas) {
    porEstadoMap.set(b.estado, (porEstadoMap.get(b.estado) ?? 0) + 1)
    if (b.estado === 'valida') validas++
    else if (b.estado === 'usada') usadas++
    else if (b.estado === 'anulada') anuladas++
  }
  const porEstado = [...porEstadoMap.entries()].map(([estado, count]) => ({ estado, count }))
  const porEscanear = validas
  const tasaOcupacion = totalCupo > 0 ? Math.round(((validas + usadas) / totalCupo) * 1000) / 10 : 0

  const ahora = Date.now()
  const eventosActivos = eventos.filter((e) => e.activo && new Date(e.fecha_evento).getTime() >= ahora).length

  // ultimas 5 boletas del rango
  const ultimasBoletas = [...boletasRango]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map((b) => {
      const tipo = tipoMap.get(b.tipo_id)
      return {
        codigo: `PM-TKT-...${b.id.slice(0, 4)}`,
        evento: eventoTitulo.get(b.evento_id) ?? b.evento_id,
        tipo: tipo?.nombre ?? b.tipo_id,
        estado: b.estado,
        created_at: b.created_at,
        titular: b.estado,
      }
    })

  // placeholder: fetch titulares reales para ultimas (limit 5) — segundo query ligero
  // para no complicar, dejamos ultimas vacias si no hay boletas con titular, el dashboard puede usar otra query
  // hacemos fetch real de ultimas con titular
  let ultimasConTitular: BoleteriaAnalytics['ultimasBoletas'] = []
  if (boletasRango.length > 0) {
    const ids = [...boletasRango]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map((b) => b.id)
    const { data: ultimasDetalle } = await (supabase.from('boletas') as any)
      .select('codigo, estado, created_at, titular_nombre, tipos_boleta(nombre), eventos_boletos(titulo)')
      .in('id', ids)
      .order('created_at', { ascending: false })
    ultimasConTitular = ((ultimasDetalle ?? []) as Array<{
      codigo: string
      estado: string
      created_at: string
      titular_nombre: string
      tipos_boleta: { nombre: string } | null
      eventos_boletos: { titulo: string } | null
    }>).map((r) => ({
      codigo: r.codigo,
      evento: r.eventos_boletos?.titulo ?? '',
      tipo: r.tipos_boleta?.nombre ?? '',
      estado: r.estado,
      created_at: r.created_at,
      titular: r.titular_nombre,
    }))
  }

  return {
    rango,
    totalIngresos,
    deltaIngresos: deltaPct(totalIngresos, ingresosPrev),
    totalBoletas,
    deltaBoletas,
    ticketPromedio,
    deltaTicket: deltaPct(ticketPromedio, ticketPrev),
    tasaOcupacion,
    serie,
    topEventos,
    porEvento,
    porEstado,
    ultimasBoletas: ultimasConTitular,
    totalCupo,
    validas,
    usadas,
    anuladas,
    porEscanear,
    eventosActivos,
  }
}

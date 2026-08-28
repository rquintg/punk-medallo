import { getSupabaseAdmin } from './supabase-admin'
import { getTiendaConfig } from '@/features/tienda/services/tienda-config'

export const STOCK_BAJO_UMBRAL = 10

export type RangoDias = 7 | 30 | 90
export const RANGOS: RangoDias[] = [7, 30, 90]

export const ESTADOS_VALIDOS = ['aprobado', 'preparando', 'enviado', 'entregado']

export interface SerieDia {
  fecha: string
  etiqueta: string
  ingresos: number
  ordenes: number
}

export interface UltimaOrdenInfo {
  numero_pedido: string
  nombre_entrega: string
  total: number
  estado: string
  metodo_pago: string | null
  created_at: string
  items: number
}

export interface DashboardAnalytics {
  rango: RangoDias
  totalIngresos: number
  deltaIngresos: number | null
  totalOrdenes: number
  deltaOrdenes: number | null
  ticketPromedio: number
  deltaTicket: number | null
  serie: SerieDia[]
  topProductos: { nombre: string; cantidad: number; ingresos: number }[]
  porCategoria: { nombre: string; ingresos: number }[]
  porMetodoPago: { nombre: string; ingresos: number }[]
  ordenesPorEstado: { estado: string; count: number }[]
  cuponesUsados: number
  cuponesDescontado: number
  ultimasOrdenes: UltimaOrdenInfo[]
  porEnviar: number
  stockBajo: number
  contraEntregaPorCobrar: number
  contraEntregaPedidos: number
  politicasPct: number
}

interface PedidoAnalytics {
  id: string
  numero_pedido: string
  nombre_entrega: string
  total: number | null
  envio: number | null
  estado: string
  metodo_pago: string | null
  created_at: string
  acepta_politicas: boolean | null
}

// Bogotá es UTC-5 (sin horario de verano): medianoche local = 05:00 UTC.
function inicioDiaBogota(offsetDias = 0): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const fecha = new Date(Date.now() - offsetDias * 86_400_000)
  return `${formatter.format(fecha)}T05:00:00.000Z`
}

function claveDia(iso: string): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return formatter.format(new Date(iso))
}

function ingresoDe(p: { total: number | null; estado: string; metodo_pago: string | null }): number {
  // Los pedidos contra entrega solo cuentan como ingreso cuando se entregan
  return p.metodo_pago === 'CONTRA_ENTREGA' && p.estado !== 'entregado' ? 0 : (p.total ?? 0)
}

function deltaPct(actual: number, previo: number): number | null {
  if (previo <= 0) return null
  return Math.round(((actual - previo) / previo) * 1000) / 10
}

export async function getDashboardAnalytics(rango: RangoDias): Promise<DashboardAnalytics> {
  const supabase = getSupabaseAdmin()
  const desde = inicioDiaBogota(rango - 1)
  const desdePrev = inicioDiaBogota(rango - 1 + rango)

  const seleccionPedido = 'id, numero_pedido, nombre_entrega, total, envio, estado, metodo_pago, created_at, acepta_politicas'

  const [
    rangoRes,
    previoRes,
    porEnviarRes,
    productosRes,
    variantesRes,
    itemsRes,
    cuponesRes,
    estadosRes,
    ultimasRes,
    itemsUltimasRes,
    codRes,
    boleteriaPedidosRes,
  ] = await Promise.all([
    supabase.from('pedidos').select(seleccionPedido).in('estado', ESTADOS_VALIDOS).gte('created_at', desde),
    supabase.from('pedidos').select(seleccionPedido).in('estado', ESTADOS_VALIDOS).gte('created_at', desdePrev).lt('created_at', desde),
    supabase.from('pedidos').select('id').in('estado', ['pendiente', 'aprobado', 'preparando']),
    (supabase.from('productos') as any).select('id, stock, activo'),
    (supabase.from('producto_variantes') as any).select('producto_id, stock'),
    (supabase.from('pedido_items') as any).select(
      'cantidad, precio, pedido_id, productos!inner(nombre, slug, categorias(nombre))',
    ),
    supabase.from('pedidos').select('id, descuento').not('cupon_id', 'is', null),
    supabase.from('pedidos').select('id, estado, acepta_politicas'),
    supabase.from('pedidos').select('id, numero_pedido, nombre_entrega, total, estado, metodo_pago, created_at').order('created_at', { ascending: false }).limit(20),
    (supabase.from('pedido_items') as any).select('pedido_id'),
    supabase.from('pedidos').select('total').in('estado', ['aprobado', 'preparando', 'enviado']).eq('metodo_pago', 'CONTRA_ENTREGA'),
    (supabase.from('pedido_items') as any).select('pedido_id').not('tipo_boleta_id', 'is', null),
  ])

  const boleteriaIds = new Set(((boleteriaPedidosRes.data ?? []) as { pedido_id: string }[]).map((r) => r.pedido_id))
  const pedidosRango = ((rangoRes.data ?? []) as PedidoAnalytics[]).filter((p) => !boleteriaIds.has(p.id))
  const pedidosPrevios = ((previoRes.data ?? []) as PedidoAnalytics[]).filter((p) => !boleteriaIds.has(p.id))

  let totalIngresos = 0
  let totalOrdenes = 0
  const ingresosPrevios = pedidosPrevios.reduce((sum, p) => sum + ingresoDe(p), 0)
  const ordenesPrevias = pedidosPrevios.length

  const porDia = new Map<string, { ingresos: number; ordenes: number }>()
  const porMetodo = new Map<string, { ingresos: number; ordenes: number }>()

  for (const p of pedidosRango) {
    const dia = claveDia(p.created_at)
    const actual = porDia.get(dia) ?? { ingresos: 0, ordenes: 0 }
    actual.ingresos += ingresoDe(p)
    actual.ordenes += 1
    porDia.set(dia, actual)

    const metodo = p.metodo_pago ?? 'Wompi'
    const m = porMetodo.get(metodo) ?? { ingresos: 0, ordenes: 0 }
    m.ingresos += ingresoDe(p)
    m.ordenes += 1
    porMetodo.set(metodo, m)

    totalIngresos += ingresoDe(p)
    totalOrdenes += 1
  }

  const serie: SerieDia[] = []
  const etiquetas = new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota', day: 'numeric', month: 'short' })
  for (let i = rango - 1; i >= 0; i--) {
    const dia = inicioDiaBogota(i).slice(0, 10)
    const punto = porDia.get(dia) ?? { ingresos: 0, ordenes: 0 }
    serie.push({
      fecha: dia,
      etiqueta: etiquetas.format(new Date(`${dia}T12:00:00.000Z`)),
      ingresos: punto.ingresos,
      ordenes: punto.ordenes,
    })
  }

  const ticketsPrevios = ordenesPrevias > 0 ? ingresosPrevios / ordenesPrevias : 0
  const ticketPromedio = totalOrdenes > 0 ? totalIngresos / totalOrdenes : 0

  const idsRango = new Set(pedidosRango.map((p) => p.id))

  const items = (itemsRes.data ?? []) as unknown as {
    cantidad: number
    precio: number
    pedido_id: string
    productos: { nombre: string; slug: string; categorias: { nombre: string } | { nombre: string }[] | null }
  }[]

  const topMap = new Map<string, { nombre: string; cantidad: number; ingresos: number }>()
  const catMap = new Map<string, number>()

  for (const item of items) {
    if (!idsRango.has(item.pedido_id)) continue
    const nombre = item.productos?.nombre ?? 'Producto eliminado'
    const cats = item.productos?.categorias
    const categoria = Array.isArray(cats) ? cats[0]?.nombre : (cats?.nombre ?? 'Sin categoría')
    const cantidad = item.cantidad ?? 0
    const ingresos = cantidad * (item.precio ?? 0)

    const top = topMap.get(nombre) ?? { nombre, cantidad: 0, ingresos: 0 }
    top.cantidad += cantidad
    top.ingresos += ingresos
    topMap.set(nombre, top)

    catMap.set(categoria, (catMap.get(categoria) ?? 0) + ingresos)
  }

  const topProductos = [...topMap.values()].sort((a, b) => b.ingresos - a.ingresos).slice(0, 6)
  const porCategoria = [...catMap.entries()]
    .map(([nombre, ingresos]) => ({ nombre, ingresos }))
    .sort((a, b) => b.ingresos - a.ingresos)

  const porMetodoPago = [...porMetodo.entries()]
    .map(([nombre, v]) => ({ nombre, ingresos: v.ingresos }))
    .sort((a, b) => b.ingresos - a.ingresos)

  const estadosRawAll = (estadosRes.data ?? []) as { id: string; estado: string; acepta_politicas: boolean | null }[]
  const estadosRaw = estadosRawAll.filter((r) => !boleteriaIds.has(r.id))
  const ordenesPorEstado = Object.entries(
    estadosRaw.reduce((acc: Record<string, number>, item) => {
      const e = item.estado
      acc[e] = (acc[e] || 0) + 1
      return acc
    }, {}),
  ).map(([estado, count]) => ({ estado, count }))

  const politicasTotal = estadosRaw.length
  const politicasPct = politicasTotal > 0
    ? Math.round((estadosRaw.filter((p) => p.acepta_politicas === true).length / politicasTotal) * 100)
    : 0

  const cuponesDataAll = (cuponesRes.data ?? []) as { id: string; descuento: number | null }[]
  const cuponesData = cuponesDataAll.filter((r) => !boleteriaIds.has(r.id))
  const cuponesDescontado = cuponesData.reduce((sum, c) => sum + (c.descuento ?? 0), 0)

  const ultimasOrdenesAll = (ultimasRes.data as unknown as (UltimaOrdenInfo & { id: string })[]) ?? []
  const ultimasOrdenesRaw = ultimasOrdenesAll.filter((r) => !boleteriaIds.has(r.id)).slice(0, 5)
  const itemsUltimas = (itemsUltimasRes.data ?? []) as { pedido_id: string }[]
  const itemsPorPedido = new Map<string, number>()
  for (const i of itemsUltimas) {
    itemsPorPedido.set(i.pedido_id, (itemsPorPedido.get(i.pedido_id) ?? 0) + 1)
  }
  const ultimasOrdenes = ultimasOrdenesRaw.map((o) => ({
    numero_pedido: o.numero_pedido,
    nombre_entrega: o.nombre_entrega,
    total: o.total,
    estado: o.estado,
    metodo_pago: o.metodo_pago,
    created_at: o.created_at,
    items: itemsPorPedido.get(o.id) ?? 0,
  }))

  const productos = (productosRes.data ?? []) as { id: string; stock: number; activo: boolean | null }[]
  const variantes = (variantesRes.data ?? []) as { producto_id: string; stock: number }[]

  const variantesMap = new Map<string, number>()
  const productosConVariantes = new Set<string>()
  for (const v of variantes) {
    productosConVariantes.add(v.producto_id)
    variantesMap.set(v.producto_id, (variantesMap.get(v.producto_id) ?? 0) + v.stock)
  }

  const tiendaCfg = await getTiendaConfig()
  const umbralStock = tiendaCfg.stockBajoUmbral ?? STOCK_BAJO_UMBRAL
  const stockBajo = productos.filter((p) => {
    if (p.activo === false) return false
    const efectivo = productosConVariantes.has(p.id)
      ? (variantesMap.get(p.id) ?? 0)
      : p.stock
    return efectivo < umbralStock
  }).length

  const codData = (codRes.data ?? []) as { total: number | null }[]
  const contraEntregaPorCobrar = codData.reduce((sum, p) => sum + (p.total ?? 0), 0)

  const porEnviarFiltrado = ((porEnviarRes.data ?? []) as { id: string }[]).filter((r) => !boleteriaIds.has(r.id)).length
  return {
    rango,
    totalIngresos,
    deltaIngresos: deltaPct(totalIngresos, ingresosPrevios),
    totalOrdenes,
    deltaOrdenes: deltaPct(totalOrdenes, ordenesPrevias),
    ticketPromedio,
    deltaTicket: deltaPct(ticketPromedio, ticketsPrevios),
    serie,
    topProductos,
    porCategoria,
    porMetodoPago,
    ordenesPorEstado,
    cuponesUsados: cuponesData.length,
    cuponesDescontado,
    ultimasOrdenes,
    porEnviar: porEnviarFiltrado,
    stockBajo,
    contraEntregaPorCobrar,
    contraEntregaPedidos: codData.length,
    politicasPct,
  }
}
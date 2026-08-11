import { getSupabaseAdmin } from './supabase-admin'

export const STOCK_BAJO_UMBRAL = 10

export interface DashboardStats {
  ingresosHoy: number
  envioHoy: number
  ordenesHoy: number
  porEnviar: number
  stockBajo: number
  politicasAceptadas: number
  totalPedidos: number
  ordenesPorEstado: { estado: string; count: number }[]
  ultimasOrdenes: {
    numero_pedido: string
    nombre_entrega: string
    total: number
    estado: string
    created_at: string
  }[]
}

const ESTADOS_VALIDOS = ['aprobado', 'preparando', 'enviado', 'entregado']

function startOfDayBogota(): string {
  // Bogotá es UTC-5: medianoche local = 05:00 UTC
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return `${formatter.format(new Date())}T05:00:00.000Z`
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = getSupabaseAdmin()
  const hoy = startOfDayBogota()

  const [ingresosRes, ordenesCountRes, porEnviarRes, productosRes, variantesRes, estadosRes, ultimasRes] =
    await Promise.all([
      supabase
        .from('pedidos')
        .select('total, envio')
        .in('estado', ESTADOS_VALIDOS)
        .gte('created_at', hoy),
      supabase
        .from('pedidos')
        .select('id', { count: 'exact', head: true })
        .in('estado', ESTADOS_VALIDOS)
        .gte('created_at', hoy),
      supabase
        .from('pedidos')
        .select('id')
        .in('estado', ['pendiente', 'aprobado', 'preparando']),
      (supabase.from('productos') as any)
        .select('id, stock, activo'),
      (supabase.from('producto_variantes') as any)
        .select('producto_id, stock'),
      supabase
        .from('pedidos')
        .select('estado, acepta_politicas'),
      supabase
        .from('pedidos')
        .select('numero_pedido, nombre_entrega, total, estado, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
    ])

  const pedidosHoy = (ingresosRes.data ?? []) as { total: number; envio: number | null }[]

  const ingresosHoy = pedidosHoy.reduce((sum, p) => sum + (p.total ?? 0), 0)
  const envioHoy = pedidosHoy.reduce((sum, p) => sum + (p.envio ?? 0), 0)

  const productos = (productosRes.data ?? []) as { id: string; stock: number; activo: boolean | null }[]
  const variantes = (variantesRes.data ?? []) as { producto_id: string; stock: number }[]

  const variantesMap = new Map<string, number>()
  const productosConVariantes = new Set<string>()
  for (const v of variantes) {
    productosConVariantes.add(v.producto_id)
    variantesMap.set(v.producto_id, (variantesMap.get(v.producto_id) ?? 0) + v.stock)
  }

  const stockBajo = productos.filter((p) => {
    if (p.activo === false) return false
    const efectivo = productosConVariantes.has(p.id)
      ? (variantesMap.get(p.id) ?? 0)
      : p.stock
    return efectivo < STOCK_BAJO_UMBRAL
  }).length

  const estadosRaw = (estadosRes.data ?? []) as { estado: string; acepta_politicas: boolean | null }[]
  const politicasAceptadas = estadosRaw.filter((p) => p.acepta_politicas === true).length

  const ordenesPorEstado = Object.entries(
    estadosRaw.reduce((acc: Record<string, number>, item) => {
      const e = item.estado
      acc[e] = (acc[e] || 0) + 1
      return acc
    }, {}),
  ).map(([estado, count]) => ({ estado, count }))

  return {
    ingresosHoy,
    envioHoy,
    ordenesHoy: ordenesCountRes.count ?? 0,
    porEnviar: (porEnviarRes.data as unknown as unknown[])?.length ?? 0,
    stockBajo,
    politicasAceptadas,
    totalPedidos: estadosRaw.length,
    ordenesPorEstado,
    ultimasOrdenes: (ultimasRes.data as unknown as DashboardStats['ultimasOrdenes']) ?? [],
  }
}
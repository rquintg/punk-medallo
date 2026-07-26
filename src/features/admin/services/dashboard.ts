import { getSupabaseAdmin } from './supabase-admin'

export interface DashboardStats {
  ingresosHoy: number
  ordenesHoy: number
  porEnviar: number
  stockBajo: number
  ordenesPorEstado: { estado: string; count: number }[]
  ultimasOrdenes: {
    numero_pedido: string
    nombre_entrega: string
    total: number
    estado: string
    created_at: string
  }[]
}

function startOfDay() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = getSupabaseAdmin()
  const hoy = startOfDay()

  const [ingresosRes, ordenesCountRes, porEnviarRes, productosRes, variantesRes, estadosRes, ultimasRes] =
    await Promise.all([
      supabase
        .from('pedidos')
        .select('total')
        .in('estado', ['aprobado', 'preparando', 'enviado', 'entregado'])
        .gte('created_at', hoy),
      supabase
        .from('pedidos')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', hoy),
      supabase
        .from('pedidos')
        .select('id')
        .in('estado', ['pendiente', 'aprobado', 'preparando']),
      (supabase.from('productos') as any)
        .select('id, stock'),
      (supabase.from('producto_variantes') as any)
        .select('producto_id, stock'),
      supabase
        .from('pedidos')
        .select('estado'),
      supabase
        .from('pedidos')
        .select('numero_pedido, nombre_entrega, total, estado, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
    ])

  const ingresosHoy = ((ingresosRes.data ?? []) as { total: number }[]).reduce(
    (sum, p) => sum + (p.total ?? 0),
    0,
  )

  const productos = (productosRes.data ?? []) as { id: string; stock: number }[]
  const variantes = (variantesRes.data ?? []) as { producto_id: string; stock: number }[]

  const variantesMap = new Map<string, number>()
  const productosConVariantes = new Set<string>()
  for (const v of variantes) {
    productosConVariantes.add(v.producto_id)
    variantesMap.set(v.producto_id, (variantesMap.get(v.producto_id) ?? 0) + v.stock)
  }

  const stockBajo = productos.filter((p) => {
    if (productosConVariantes.has(p.id)) {
      return (variantesMap.get(p.id) ?? 0) < 10
    }
    return p.stock < 10 && p.stock >= 0
  }).length

  const estadosRaw = (estadosRes.data ?? []) as { estado: string }[]
  const ordenesPorEstado = Object.entries(
    estadosRaw.reduce((acc: Record<string, number>, item) => {
      const e = item.estado
      acc[e] = (acc[e] || 0) + 1
      return acc
    }, {}),
  ).map(([estado, count]) => ({ estado, count }))

  return {
    ingresosHoy,
    ordenesHoy: ordenesCountRes.count ?? 0,
    porEnviar: (porEnviarRes.data as unknown as any[])?.length ?? 0,
    stockBajo,
    ordenesPorEstado,
    ultimasOrdenes: (ultimasRes.data as unknown as DashboardStats['ultimasOrdenes']) ?? [],
  }
}

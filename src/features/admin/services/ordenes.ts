import { getSupabaseAdmin } from './supabase-admin'

export interface OrdenRow {
  id: string
  numero_pedido: string
  nombre_entrega: string
  email: string
  total: number
  estado: string
  created_at: string
}

export interface OrdenDetalle extends OrdenRow {
  telefono: string
  direccion: string
  departamento: string
  ciudad: string
  barrio: string
  notas: string
  usuario_id: string | null
  pedido_items: {
    id: string
    cantidad: number
    precio: number
    talla: string | null
    color: string | null
    nombre: string
    imagen_url: string | null
    productos: {
      nombre: string
      slug: string
    } | null
  }[]
}

export interface OrdenesResponse {
  data: OrdenRow[]
  total: number
}

export async function getOrdenes(
  page: number,
  estado?: string,
  pageSize = 20,
): Promise<OrdenesResponse> {
  const supabase = getSupabaseAdmin()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('pedidos')
    .select('*', { count: 'exact' })

  if (estado) {
    query = query.eq('estado', estado)
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('getOrdenes error:', error)
    throw new Error(error.message)
  }

  return {
    data: (data as unknown as OrdenRow[]) ?? [],
    total: count ?? 0,
  }
}

export async function getOrdenByNumero(numero: string): Promise<OrdenDetalle | null> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await (supabase
    .from('pedidos')
    .select('*, pedido_items(*, productos(nombre, slug))')
    .eq('numero_pedido', numero)
    .single() as any)

  if (error) {
    console.error('getOrdenByNumero error:', error)
    return null
  }

  return (data as OrdenDetalle) ?? null
}

export async function getEstadosDisponibles(): Promise<string[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('pedidos')
    .select('estado')
    .not('estado', 'eq', 'cancelado')

  if (error) {
    console.error('getEstadosDisponibles error:', error)
    return []
  }

  const estados = [...new Set((data as unknown as { estado: string }[])?.map((d) => d.estado) ?? [])]
  return estados.sort()
}

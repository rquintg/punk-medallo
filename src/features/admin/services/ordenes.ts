import { getSupabaseAdmin } from './supabase-admin'

export interface OrdenRow {
  id: string
  numero_pedido: string
  nombre_entrega: string
  email: string
  total: number
  envio: number | null
  recargo: number | null
  descuento: number | null
  cupon_codigo: string | null
  metodo_pago: string | null
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
  ownerId?: string | null,
): Promise<OrdenesResponse> {
  const supabase = getSupabaseAdmin()

  if (ownerId) {
    // publicador: solo pedidos que contienen al menos un producto suyo
    const { data: productos } = await (supabase.from('productos') as any).select('id').eq('owner_id', ownerId)
    const productoIds = ((productos ?? []) as { id: string }[]).map((p) => p.id)
    if (productoIds.length === 0) return { data: [], total: 0 }
    const { data: items } = await (supabase.from('pedido_items') as any).select('pedido_id').in('producto_id', productoIds)
    const pedidoIds = [...new Set(((items ?? []) as { pedido_id: string }[]).map((i) => i.pedido_id))]
    if (pedidoIds.length === 0) return { data: [], total: 0 }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    let query = supabase.from('pedidos').select('*', { count: 'exact' }).in('id', pedidoIds)
    if (estado) query = query.eq('estado', estado)
    const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to)
    if (error) {
      console.error('getOrdenes error:', error)
      throw new Error(error.message)
    }
    return { data: (data as unknown as OrdenRow[]) ?? [], total: count ?? 0 }
  }

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

export async function getOrdenByNumero(numero: string, ownerId?: string | null): Promise<OrdenDetalle | null> {
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

  const orden = data as OrdenDetalle
  if (ownerId && orden) {
    // verificar que al menos un item sea del publicador
    const { data: productos } = await (supabase.from('productos') as any).select('id').eq('owner_id', ownerId)
    const owned = new Set(((productos ?? []) as { id: string }[]).map((p) => p.id))
    const tienePropio = orden.pedido_items.some((it: any) => owned.has(it.producto_id))
    if (!tienePropio) return null
  }

  return orden ?? null
}

import { getSupabaseAdmin } from './supabase-admin'
import type { Cupon, TipoCupon } from '@/features/cupones/types'

export interface CuponRow {
  id: string
  codigo: string
  tipo: TipoCupon
  valor: number
  descuento_maximo: number | null
  monto_minimo: number
  fecha_inicio: string | null
  fecha_fin: string | null
  max_usos: number | null
  usos: number
  activo: boolean
  created_at: string
}

export function estadoCupon(cupon: CuponRow): 'activo' | 'vencido' | 'inactivo' {
  if (!cupon.activo) return 'inactivo'
  const fin = cupon.fecha_fin ? new Date(cupon.fecha_fin).getTime() : null
  if (fin && Date.now() > fin) return 'vencido'
  return 'activo'
}

export function tipoCuponLabel(tipo: TipoCupon): string {
  switch (tipo) {
    case 'porcentaje':
      return '%'
    case 'fijo':
      return 'Fijo'
    case 'envio':
      return 'Envío gratis'
  }
}

export function descripcionCupon(cupon: CuponRow): string {
  if (cupon.tipo === 'envio') return 'Envío gratis'
  if (cupon.tipo === 'porcentaje') {
    const base = `${cupon.valor}% de descuento`
    return cupon.descuento_maximo
      ? `${base} (máx $${cupon.descuento_maximo.toLocaleString('es-CO')})`
      : base
  }
  return `$${cupon.valor.toLocaleString('es-CO')} de descuento`
}

export async function getCupones(): Promise<CuponRow[]> {
  const supabase = getSupabaseAdmin()
  const { data } = await (supabase.from('cupones') as any)
    .select('*')
    .order('created_at', { ascending: false })
  return (data ?? []) as CuponRow[]
}

export async function getCuponById(id: string): Promise<Cupon | null> {
  const supabase = getSupabaseAdmin()
  const { data } = await (supabase.from('cupones') as any)
    .select('*')
    .eq('id', id)
    .maybeSingle()
  return (data as Cupon | null) ?? null
}
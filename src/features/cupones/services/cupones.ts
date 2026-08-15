import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/features/admin/services/supabase-admin'
import { normalizarCodigo, calcularDescuento } from '@/features/cupones/calculo'
import type {
  Cupon,
  MotivoRechazo,
  ResultadoValidacion,
  TipoCupon,
} from '@/features/cupones/types'

interface CuponRow {
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
}

function toCupon(row: CuponRow): Cupon {
  return {
    ...row,
    created_at: '',
  }
}

export async function buscarCupon(
  cliente: SupabaseClient,
  codigo: string,
): Promise<Cupon | null> {
  const { data } = await cliente
    .from('cupones')
    .select('*')
    .eq('codigo', normalizarCodigo(codigo))
    .maybeSingle()

  if (!data) return null
  return toCupon(data as unknown as CuponRow)
}

/**
 * Validación de reglas previas (no consume cupo):
 * existe, activo, vigencia, monto mínimo y 1 uso por email.
 * El descuento devuelto es orientativo para la UI; el checkout
 * recalcula y reserva el cupo de forma atómica.
 */
export async function validarCupon(
  cliente: SupabaseClient,
  codigo: string,
  email: string,
  subtotal: number,
): Promise<ResultadoValidacion> {
  const cupon = await buscarCupon(cliente, codigo)

  if (!cupon) {
    return { valido: false, motivo: 'no_existe', descuento: 0, minimo: 0 }
  }

  const ahora = Date.now()
  const inicio = cupon.fecha_inicio ? new Date(cupon.fecha_inicio).getTime() : null
  const fin = cupon.fecha_fin ? new Date(cupon.fecha_fin).getTime() : null

  let motivo: MotivoRechazo | null = null
  if (!cupon.activo) motivo = 'inactivo'
  else if (inicio && ahora < inicio) motivo = 'no_inicia'
  else if (fin && ahora > fin) motivo = 'vencido'
  else if (subtotal < cupon.monto_minimo) motivo = 'minimo'
  else {
    const { data: yaUsado } = await cliente
      .from('cupon_redenciones')
      .select('id')
      .eq('cupon_id', cupon.id)
      .eq('email', email.trim().toLowerCase())
      .maybeSingle()

    if (yaUsado) motivo = 'ya_usado'
  }

  if (motivo) {
    return { valido: false, motivo, descuento: 0, minimo: cupon.monto_minimo }
  }

  const descuento =
    cupon.tipo === 'envio'
      ? 0
      : calcularDescuento(cupon.tipo, cupon.valor, cupon.descuento_maximo, subtotal)

  return {
    valido: true,
    descuento,
    minimo: cupon.monto_minimo,
    cupon: {
      id: cupon.id,
      codigo: cupon.codigo,
      tipo: cupon.tipo,
      valor: cupon.valor,
      descuento_maximo: cupon.descuento_maximo,
    },
  }
}

interface RpcResult {
  data: unknown
  error: { message: string } | null
}

const adminRpc = (name: string, args: Record<string, unknown>): Promise<RpcResult> =>
  (getSupabaseAdmin() as unknown as {
    rpc: (name: string, args: Record<string, unknown>) => Promise<RpcResult>
  }).rpc(name, args)

export interface ResultadoConsumoCupon {
  ok: boolean
  /** Presente cuando el RPC falló por infraestructura (función faltante, DB, red). */
  errorMessage?: string
}

/** Consume una unidad de cupo de forma atómica (RPC en Postgres). */
export async function consumirCupon(cuponId: string): Promise<ResultadoConsumoCupon> {
  const { data, error } = await adminRpc('consumir_cupon', { p_cupon_id: cuponId })

  if (error) return { ok: false, errorMessage: error.message }
  return { ok: (data as boolean) ?? false }
}

/** Rollback de una unidad de cupo (pedido fallido). */
export async function liberarCupon(cuponId: string): Promise<void> {
  const { error } = await adminRpc('liberar_cupon', { p_cupon_id: cuponId })
  if (error) {
    // No lanzar aquí (el pedido ya puede haber fallado); dejar rastro en logs.
    console.error('liberar_cupon RPC error:', error.message)
  }
}

/**
 * Registra la redención por email; false si ya existe (unique),
 * indicando que el email ya usó el cupón.
 */
export async function registrarRedencion(
  cuponId: string,
  email: string,
  pedidoId: string,
): Promise<boolean> {
  const { error } = await (getSupabaseAdmin().from('cupon_redenciones') as any).insert({
    cupon_id: cuponId,
    email: email.trim().toLowerCase(),
    pedido_id: pedidoId,
  })

  if (error && error.code === '23505') return false
  if (error) throw error
  return true
}
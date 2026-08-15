'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '../services/supabase-admin'
import { requirePermissionAction } from '../utils/auth-server'
import { normalizarCodigo } from '@/features/cupones/calculo'
import type { TipoCupon } from '@/features/cupones/types'

function num(formData: FormData, key: string): number {
  const v = Number(formData.get(key))
  return Number.isFinite(v) ? v : 0
}

function nullableDate(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? '').trim()
  return v ? new Date(v).toISOString() : null
}

function nullableNum(formData: FormData, key: string): number | null {
  const v = String(formData.get(key) ?? '').trim()
  if (!v) return null
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : null
}

function parseForm(formData: FormData) {
  const tipo = String(formData.get('tipo') ?? '')
  const tipoValido: TipoCupon = ['porcentaje', 'fijo', 'envio'].includes(tipo)
    ? (tipo as TipoCupon)
    : 'porcentaje'
  return {
    codigo: normalizarCodigo(String(formData.get('codigo') ?? '')),
    tipo: tipoValido,
    valor: tipoValido === 'envio' ? 1 : Math.max(0, num(formData, 'valor')),
    descuento_maximo: nullableNum(formData, 'descuento_maximo'),
    monto_minimo: Math.max(0, num(formData, 'monto_minimo')),
    fecha_inicio: nullableDate(formData, 'fecha_inicio'),
    fecha_fin: nullableDate(formData, 'fecha_fin'),
    max_usos: nullableNum(formData, 'max_usos'),
    activo: formData.get('activo') === 'on',
  }
}

export async function createCupon(formData: FormData) {
  await requirePermissionAction('manage_cupones')
  const supabase = getSupabaseAdmin()
  const cupon = parseForm(formData)

  if (!cupon.codigo) throw new Error('El código es requerido')

  const { error } = await (supabase.from('cupones') as any).insert(cupon)
  if (error) {
    if (error.code === '23505') throw new Error('Ya existe un cupón con ese código')
    throw new Error(error.message)
  }

  revalidatePath('/admin/cupones')
}

export async function updateCupon(id: string, formData: FormData) {
  await requirePermissionAction('manage_cupones')
  const supabase = getSupabaseAdmin()
  const cupon = parseForm(formData)

  if (!cupon.codigo) throw new Error('El código es requerido')

  const { error } = await (supabase.from('cupones') as any)
    .update(cupon)
    .eq('id', id)
  if (error) {
    if (error.code === '23505') throw new Error('Ya existe un cupón con ese código')
    throw new Error(error.message)
  }

  revalidatePath('/admin/cupones')
}

export async function deleteCupon(id: string) {
  await requirePermissionAction('manage_cupones')
  const supabase = getSupabaseAdmin()

  const { count } = await (supabase.from('cupon_redenciones') as any)
    .select('id', { count: 'exact', head: true })
    .eq('cupon_id', id)

  if (count && count > 0) {
    throw new Error(`No se puede eliminar: ${count} cliente(s) ya usaron este cupón`)
  }

  const { error } = await (supabase.from('cupones') as any).delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/cupones')
}
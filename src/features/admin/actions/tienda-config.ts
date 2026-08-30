'use server'

import { revalidatePath } from 'next/cache'
import { requirePermissionAction } from '@/features/admin/utils/auth-server'
import { getSupabaseAdmin } from '@/features/admin/services/supabase-admin'

const BOOLEAN_KEYS = ['mostrar_mas_pedidos', 'mostrar_ofertas', 'mostrar_live', 'live_revive', 'tienda_activa', 'boleteria_activa'] as const
const NUMBER_KEYS = [
  'envio_gratis_umbral',
  'envio_tarifa_antioquia',
  'envio_tarifa_centro',
  'envio_tarifa_resto',
  'cod_recargo',
  'mas_pedidos_dias',
  'mas_pedidos_limit',
  'stock_bajo_umbral',
  'page_size',
] as const
const TEXT_KEYS = ['cod_municipios', 'live_url', 'live_titulo'] as const
type TiendaKey = typeof BOOLEAN_KEYS[number] | typeof NUMBER_KEYS[number] | typeof TEXT_KEYS[number]

const LIMITS: Record<string, { min: number; max: number; step?: number }> = {
  envio_gratis_umbral: { min: 50_000, max: 500_000 },
  envio_tarifa_antioquia: { min: 0, max: 50_000 },
  envio_tarifa_centro: { min: 0, max: 50_000 },
  envio_tarifa_resto: { min: 0, max: 50_000 },
  cod_recargo: { min: 0, max: 20_000 },
  mas_pedidos_dias: { min: 7, max: 90 },
  mas_pedidos_limit: { min: 1, max: 12 },
  stock_bajo_umbral: { min: 1, max: 50 },
  page_size: { min: 6, max: 48 },
}

// Sanitiza lista de municipios: minúsculas, sin tildes raras, 2-30 chars, a-z, max 20
function sanitizarMunicipios(raw: string): string {
  const parts = raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 20)
    .map((s) => s.replace(/[^a-z0-9\s\-]/g, '').slice(0, 30).trim())
    .filter((s) => s.length >= 2)
  if (parts.length === 0) throw new Error('Lista de municipios vacia')
  return parts.join(',')
}

// Valida la URL de la transmision: https obligatorio, max 500 chars
function validarLiveUrl(raw: string): string {
  const url = raw.trim()
  if (!url) throw new Error('URL de transmision vacia')
  if (!/^https:\/\/[^\s]+$/.test(url) || url.length > 500) {
    throw new Error('URL invalida (debe empezar con https://)')
  }
  return url
}

export async function updateTiendaConfig(key: string, valor: boolean) {
  await requirePermissionAction('manage_tienda_config')
  if (!(BOOLEAN_KEYS as readonly string[]).includes(key)) throw new Error('Key invalida')
  const supabase = getSupabaseAdmin()
  const { error } = await (supabase.from('tienda_config') as any).upsert(
    { key, valor, valor_text: String(valor), tipo: 'boolean', updated_at: new Date().toISOString() },
    { onConflict: 'key' },
  )
  if (error) throw new Error(error.message)
  revalidatePath('/tienda', 'layout')
  revalidatePath('/boletas', 'layout')
  revalidatePath('/', 'layout')
  revalidatePath('/admin/tienda')
}

export async function updateTiendaConfigValor(key: string, valorText: string) {
  await requirePermissionAction('manage_tienda_config')
  const supabase = getSupabaseAdmin()
  let tipo: string
  let valorBool = true
  let storedText: string

  if ((NUMBER_KEYS as readonly string[]).includes(key)) {
    tipo = 'number'
    const n = Number(valorText.replace(/[^\d]/g, ''))
    if (!Number.isFinite(n)) throw new Error('Valor numerico invalido')
    const lim = LIMITS[key]
    const clamped = Math.min(lim.max, Math.max(lim.min, Math.round(n)))
    storedText = String(clamped)
  } else if ((TEXT_KEYS as readonly string[]).includes(key)) {
    tipo = 'text'
    storedText =
      key === 'live_url'
        ? validarLiveUrl(valorText)
        : key === 'live_titulo'
          ? valorText.trim().slice(0, 120)
          : sanitizarMunicipios(valorText)
  } else {
    throw new Error('Key invalida')
  }

  const { error } = await (supabase.from('tienda_config') as any).upsert(
    { key, valor: valorBool, valor_text: storedText, tipo, updated_at: new Date().toISOString() },
    { onConflict: 'key' },
  )
  if (error) throw new Error(error.message)
  revalidatePath('/tienda', 'layout')
  revalidatePath('/admin/tienda')
}

const LOGO_EXT_VALIDAS = ['png', 'jpg', 'jpeg', 'webp'] as const
const LOGO_MAX_BYTES = 10 * 1024 * 1024

export async function subirLogo(formData: FormData) {
  await requirePermissionAction('manage_tienda_config')
  const supabase = getSupabaseAdmin()

  const file = formData.get('file') as File | null
  if (!file || file.size === 0) throw new Error('Archivo requerido')
  if (!file.type.startsWith('image/')) throw new Error('Solo se permiten archivos de imagen')
  if (file.size > LOGO_MAX_BYTES) throw new Error('La imagen no puede superar 10 MB')

  const ext = (file.name.split('.').pop() ?? '').toLowerCase()
  if (!(LOGO_EXT_VALIDAS as readonly string[]).includes(ext)) {
    throw new Error('Formato no permitido. Usa PNG, JPG o WebP')
  }

  // Nombre unico por upload = cache-bust del CDN de Storage
  const path = `config/logo-${Date.now()}.${ext}`
  const { error: uploadError } = await supabase.storage
    .from('productos')
    .upload(path, file, { contentType: file.type })
  if (uploadError) throw new Error(uploadError.message)

  const { data: { publicUrl } } = supabase.storage.from('productos').getPublicUrl(path)

  const { error: upsertError } = await (supabase.from('tienda_config') as any).upsert(
    { key: 'logo_url', valor: true, valor_text: publicUrl, tipo: 'text', updated_at: new Date().toISOString() },
    { onConflict: 'key' },
  )
  if (upsertError) throw new Error(upsertError.message)

  revalidatePath('/', 'layout')
  revalidatePath('/admin/tienda')
}

export async function restaurarLogo() {
  await requirePermissionAction('manage_tienda_config')
  const supabase = getSupabaseAdmin()
  const { error } = await (supabase.from('tienda_config') as any).upsert(
    { key: 'logo_url', valor: true, valor_text: '', tipo: 'text', updated_at: new Date().toISOString() },
    { onConflict: 'key' },
  )
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
  revalidatePath('/admin/tienda')
}

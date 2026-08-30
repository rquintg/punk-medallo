import { unstable_cache } from 'next/cache'
import { getSupabaseAdmin } from '@/features/admin/services/supabase-admin'

export interface TiendaConfig {
  mostrarMasPedidos: boolean
  mostrarOfertas: boolean
  envioGratisUmbral: number
  envioTarifaAntioquia: number
  envioTarifaCentro: number
  envioTarifaResto: number
  codRecargo: number
  codMunicipios: string[]
  masPedidosDias: number
  masPedidosLimit: number
  stockBajoUmbral: number
  pageSize: number
  logoUrl: string | null
  mostrarLive: boolean
  liveUrl: string | null
  liveTitulo: string | null
  liveRevive: boolean
  tiendaActiva: boolean
  boleteriaActiva: boolean
}

// Logo por defecto (visible en /, /about, /amigos y secciones de marca)
export const LOGO_DEFAULT = '/images/Logo-Punk-Medallo-2024 Blanco.png'

const DEFAULTS: TiendaConfig = {
  mostrarMasPedidos: true,
  mostrarOfertas: true,
  envioGratisUmbral: 150_000,
  envioTarifaAntioquia: 10_000,
  envioTarifaCentro: 15_000,
  envioTarifaResto: 20_000,
  codRecargo: 5_000,
  codMunicipios: ['medellin', 'bello', 'itagui', 'envigado', 'sabaneta'],
  masPedidosDias: 30,
  masPedidosLimit: 4,
  stockBajoUmbral: 10,
  pageSize: 12,
  logoUrl: null,
  mostrarLive: false,
  liveUrl: null,
  liveTitulo: null,
  liveRevive: false,
  tiendaActiva: true,
  boleteriaActiva: true,
}

function toNum(v: unknown, fallback: number): number {
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : fallback
}

function toBool(v: unknown, fallback: boolean): boolean {
  if (typeof v === 'boolean') return v
  if (v === 'true' || v === '1') return true
  if (v === 'false' || v === '0') return false
  return fallback
}

async function fetchTiendaConfig(): Promise<TiendaConfig> {
  try {
    const supabase = getSupabaseAdmin()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client sin Database generic (patrón tienda: as unknown as)
    const { data, error } = await (supabase.from('tienda_config') as any).select('key, valor, valor_text, tipo')
    if (error || !data) return DEFAULTS
    const rows = data as { key: string; valor: boolean; valor_text: string | null; tipo: string | null }[]
    const get = (key: string): string | boolean | null => {
      const r = rows.find((x) => x.key === key)
      if (!r) return null
      if (r.tipo === 'number' || r.tipo === 'text') return r.valor_text ?? String(r.valor)
      return r.valor
    }
    const codRaw = get('cod_municipios')
    const codMunicipios = typeof codRaw === 'string'
      ? codRaw.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
      : DEFAULTS.codMunicipios

    return {
      mostrarMasPedidos: toBool(get('mostrar_mas_pedidos'), DEFAULTS.mostrarMasPedidos),
      mostrarOfertas: toBool(get('mostrar_ofertas'), DEFAULTS.mostrarOfertas),
      envioGratisUmbral: toNum(get('envio_gratis_umbral'), DEFAULTS.envioGratisUmbral),
      envioTarifaAntioquia: toNum(get('envio_tarifa_antioquia'), DEFAULTS.envioTarifaAntioquia),
      envioTarifaCentro: toNum(get('envio_tarifa_centro'), DEFAULTS.envioTarifaCentro),
      envioTarifaResto: toNum(get('envio_tarifa_resto'), DEFAULTS.envioTarifaResto),
      codRecargo: toNum(get('cod_recargo'), DEFAULTS.codRecargo),
      codMunicipios: codMunicipios.length ? codMunicipios : DEFAULTS.codMunicipios,
      masPedidosDias: Math.min(90, Math.max(7, toNum(get('mas_pedidos_dias'), DEFAULTS.masPedidosDias))),
      masPedidosLimit: Math.min(12, Math.max(1, toNum(get('mas_pedidos_limit'), DEFAULTS.masPedidosLimit))),
      stockBajoUmbral: Math.min(50, Math.max(1, toNum(get('stock_bajo_umbral'), DEFAULTS.stockBajoUmbral))),
      pageSize: Math.min(48, Math.max(6, toNum(get('page_size'), DEFAULTS.pageSize))),
      logoUrl: typeof get('logo_url') === 'string' && (get('logo_url') as string).trim()
        ? (get('logo_url') as string).trim()
        : null,
      mostrarLive: toBool(get('mostrar_live'), DEFAULTS.mostrarLive),
      liveRevive: toBool(get('live_revive'), DEFAULTS.liveRevive),
      liveUrl: typeof get('live_url') === 'string' && (get('live_url') as string).trim()
        ? (get('live_url') as string).trim()
        : null,
      liveTitulo: typeof get('live_titulo') === 'string' && (get('live_titulo') as string).trim()
        ? (get('live_titulo') as string).trim()
        : null,
      tiendaActiva: toBool(get('tienda_activa'), DEFAULTS.tiendaActiva),
      boleteriaActiva: toBool(get('boleteria_activa'), DEFAULTS.boleteriaActiva),
    }
  } catch {
    return DEFAULTS
  }
}

export const getTiendaConfig = unstable_cache(fetchTiendaConfig, ['tienda-config-v2'], { revalidate: 60 })
export const TIENDA_CONFIG_DEFAULTS = DEFAULTS

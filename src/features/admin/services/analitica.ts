import crypto from 'node:crypto'
import { getSupabaseAdmin } from './supabase-admin'
import { ESTADOS_VALIDOS, type RangoDias } from './dashboard'

const SCOPES_GA4 = 'https://www.googleapis.com/auth/analytics.readonly'

interface ServiceAccount {
  client_email: string
  private_key: string
}

let cachedToken: { accessToken: string; expira: number } | null = null

function b64url(data: string | Buffer): string {
  return Buffer.from(data).toString('base64url')
}

function getServiceAccount(): ServiceAccount | null {
  const raw = process.env.GA4_SERVICE_ACCOUNT_JSON
  if (!raw) return null
  try {
    return JSON.parse(raw) as ServiceAccount
  } catch {
    return null
  }
}

export function getGa4PropertyId(): string | null {
  return process.env.GA4_PROPERTY_ID ?? null
}

export function analiticaConfigurada(): boolean {
  return !!getServiceAccount() && !!getGa4PropertyId()
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expira > Date.now() + 60_000) {
    return cachedToken.accessToken
  }
  const sa = getServiceAccount()
  if (!sa) throw new Error('GA4_SERVICE_ACCOUNT_JSON no configurado')

  const ahora = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const claims = {
    iss: sa.client_email,
    scope: SCOPES_GA4,
    aud: 'https://oauth2.googleapis.com/token',
    iat: ahora,
    exp: ahora + 3600,
  }
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claims))}`
  const firma = crypto.createSign('RSA-SHA256').update(signingInput).sign(sa.private_key, 'base64url')
  const jwt = `${signingInput}.${firma}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })
  if (!res.ok) {
    throw new Error(`OAuth Google falló: ${res.status} ${await res.text()}`)
  }
  const json = (await res.json()) as { access_token: string; expires_in?: number }
  cachedToken = {
    accessToken: json.access_token,
    expira: Date.now() + (json.expires_in ?? 3600) * 1000,
  }
  return json.access_token
}

interface FilaReporte {
  dimensiones: string[]
  metricas: number[]
}

interface ReporteRequest {
  dateRanges: { startDate: string; endDate: string }[]
  dimensions?: { name: string }[]
  metrics: { name: string }[]
  orderBys?: ({ metric: { metricName: string } } | { dimension: { dimensionName: string } })[]
  &
    { desc?: boolean }[]
  limit?: number
  dimensionFilter?: unknown
}

async function runReport(propertyId: string, req: ReporteRequest): Promise<FilaReporte[]> {
  const token = await getAccessToken()
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
    },
  )
  const json = (await res.json()) as {
    rows?: {
      dimensionValues: { value: string }[]
      metricValues: { value: string }[]
    }[]
    error?: { message: string }
  }
  if (!res.ok) {
    const msg = json.error?.message ?? `HTTP ${res.status}`
    throw new Error(`GA4 runReport: ${msg}`)
  }
  return (json.rows ?? []).map((f) => ({
    dimensiones: (f.dimensionValues ?? []).map((d) => d.value),
    metricas: (f.metricValues ?? []).map((m) => Number(m.value)),
  }))
}

async function runRealtime(propertyId: string): Promise<FilaReporte[]> {  const token = await getAccessToken()
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dimensions: [{ name: 'unifiedScreenName' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10,
      }),
    },
  )
  const json = (await res.json()) as {
    rows?: {
      dimensionValues: { value: string }[]
      metricValues: { value: string }[]
    }[]
    error?: { message: string }
  }
  if (!res.ok) {
    const msg = json.error?.message ?? `HTTP ${res.status}`
    throw new Error(`GA4 runRealtimeReport: ${msg}`)
  }
  return (json.rows ?? []).map((f) => ({
    dimensiones: (f.dimensionValues ?? []).map((d) => d.value),
    metricas: (f.metricValues ?? []).map((m) => Number(m.value)),
  }))
}

/** Realtime fresco (sin cache) — usado por /api/analitica/realtime para el bloque "Últimos 30 minutos". */
export async function getRealtime(): Promise<{ vistas: number; paginas: { ruta: string; vistas: number }[] }> {
  if (!analiticaConfigurada()) throw new Error('GA4 no configurado')
  const filas = await runRealtime(getGa4PropertyId()!)
  return {
    vistas: filas.reduce((s, f) => s + f.metricas[0], 0),
    paginas: filas.map((f) => ({ ruta: f.dimensiones[0], vistas: f.metricas[0] })),
  }
}

// --- Fechas (zona de la propiedad, asumida Bogotá UTC-5) ---
function fechaClave(fecha: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(fecha)
}

function haceDias(dias: number): string {
  return fechaClave(new Date(Date.now() - dias * 86_400_000))
}

function etiquetaFecha(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: 'America/Bogota',
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${iso}T12:00:00`))
}

function deltaPct(actual: number, previo: number): number | null {
  if (previo <= 0) return null
  return Math.round(((actual - previo) / previo) * 1000) / 10
}

// --- Tipos públicos ---
export interface AnaliticaKpis {
  vistas: number
  deltaVistas: number | null
  usuarios: number
  deltaUsuarios: number | null
  sesiones: number
  deltaSesiones: number | null
  rebote: number | null
  deltaRebote: number | null
  duracionSeg: number | null
}

export interface SerieDiaAnalitica {
  fecha: string
  etiqueta: string
  vistas: number
  usuarios: number
}

export interface ConteoAnalitica {
  nombre: string
  vista: number
  pct: number
}

export interface EmbudoPaso {
  paso: string
  etiqueta: string
  cantidad: number
  pctPasoPrevio: number | null
}

export interface AnaliticaReportes {
  configurada: boolean
  error?: string
  ventana: string
  kpis: AnaliticaKpis
  serie: SerieDiaAnalitica[]
  topPaginas: { ruta: string; vistas: number; pct: number }[]
  fuentes: ConteoAnalitica[]
  dispositivos: ConteoAnalitica[]
  paises: ConteoAnalitica[]
  horas: { hora: number; vistas: number }[]
  embudo: EmbudoPaso[]
  realtime: { vistas: number; paginas: { ruta: string; vistas: number }[] }
}

const FUENTE_LABELS: Record<string, string> = {
  Direct: 'Directo',
  'Organic Search': 'Orgánico',
  Referral: 'Referido',
  Social: 'Redes sociales',
  Email: 'Correo',
  Unassigned: 'Sin clasificar',
  Paid: 'Pago',
  'Paid Search': 'Pago (búsqueda)',
}

const DEVICE_LABELS: Record<string, string> = {
  mobile: 'Móvil',
  desktop: 'Escritorio',
  tablet: 'Tablet',
}

export const EMBUDO_ETIQUETAS: Record<string, string> = {
  view_item: 'Vieron producto',
  add_to_cart: 'Agregaron al carrito',
  begin_checkout: 'Iniciaron checkout',
  purchase: 'Compraron',
}

export async function getAnalitica(rango: RangoDias): Promise<AnaliticaReportes> {
  if (!analiticaConfigurada()) {
    return {
      configurada: false,
      ventana: '',
      kpis: { vistas: 0, deltaVistas: null, usuarios: 0, deltaUsuarios: null, sesiones: 0, deltaSesiones: null, rebote: null, deltaRebote: null, duracionSeg: null },
      serie: [],
      topPaginas: [],
      fuentes: [],
      dispositivos: [],
      paises: [],
      horas: [],
      embudo: [],
      realtime: { vistas: 0, paginas: [] },
    }
  }
  const propertyId = getGa4PropertyId()!

  const start = haceDias(rango)
  const end = haceDias(1)
  const startPrev = haceDias(rango * 2)
  const endPrev = haceDias(rango + 1)

  try {
    const [
      actualRes,
      previoRes,
      topRes,
      fuentesRes,
      dispositivosRes,
      paisesRes,
      horasRes,
      embudoRes,
      realtimeRes,
    ] = await Promise.all([
      runReport(propertyId, {
        dateRanges: [{ startDate: start, endDate: end }],
        dimensions: [{ name: 'date' }],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'totalUsers' },
          { name: 'sessions' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
        ],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
      }),
      runReport(propertyId, {
        dateRanges: [{ startDate: startPrev, endDate: endPrev }],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'totalUsers' },
          { name: 'sessions' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
        ],
      }),
      runReport(propertyId, {
        dateRanges: [{ startDate: start, endDate: end }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 15,
      }),
      runReport(propertyId, {
        dateRanges: [{ startDate: start, endDate: end }],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 8,
      }),
      runReport(propertyId, {
        dateRanges: [{ startDate: start, endDate: end }],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      }),
      runReport(propertyId, {
        dateRanges: [{ startDate: start, endDate: end }],
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 8,
      }),
      runReport(propertyId, {
        dateRanges: [{ startDate: start, endDate: end }],
        dimensions: [{ name: 'hour' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ dimension: { dimensionName: 'hour' } }],
        limit: 24,
      }),
      runReport(propertyId, {
        dateRanges: [{ startDate: start, endDate: end }],
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            inListFilter: {
              values: ['view_item', 'add_to_cart', 'begin_checkout', 'purchase'],
            },
          },
        },
      }),
      runRealtime(propertyId),
    ])

    const total = (filas: FilaReporte[], idx: number) =>
      filas.reduce((s, f) => s + f.metricas[idx], 0)

    const vistas = total(actualRes, 0)
    const vistasPrev = total(previoRes, 0)
    const usuarios = total(actualRes, 1)
    const usuariosPrev = total(previoRes, 1)
    const sesiones = total(actualRes, 2)
    const sesionesPrev = total(previoRes, 2)
    const rebote = actualRes.length ? total(actualRes, 3) / actualRes.length : null
    const rebotePrev = previoRes.length ? total(previoRes, 3) / previoRes.length : null
    const duracionAvg = Math.round(actualRes.length ? total(actualRes, 4) / actualRes.length : 0)

    const serie = actualRes.map((f) => {
      const fecha = f.dimensiones[0]
      const d = new Date(`${fecha.slice(0, 4)}-${fecha.slice(4, 6)}-${fecha.slice(6, 8)}T12:00:00`)
      return {
        fecha,
        etiqueta: d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }),
        vistas: f.metricas[0],
        usuarios: f.metricas[1],
      }
    })

    const conConteo = (filas: FilaReporte[], labels: Record<string, string>): ConteoAnalitica[] => {
      const filasFiltradas = filas.filter((f) => f.metricas[0] > 0 && f.dimensiones[0] !== '(not set)')
      const totalFiltro = total(filasFiltradas, 0)
      return filasFiltradas.map((f) => ({
        nombre: labels[f.dimensiones[0]] ?? f.dimensiones[0],
        vista: f.metricas[0],
        pct: totalFiltro > 0 ? Math.round((f.metricas[0] / totalFiltro) * 1000) / 10 : 0,
      }))
    }

    const topPaginas = conConteo(topRes, {})
      .sort((a, b) => b.vista - a.vista)
      .filter((p) => p.nombre !== '/' && !p.nombre.startsWith('/admin'))
      .map((p) => ({ ruta: p.nombre, vistas: p.vista, pct: p.pct }))

    const embudoMap = new Map(embudoRes.map((f) => [f.dimensiones[0], f.metricas[0]]))
    const pasos = ['view_item', 'add_to_cart', 'begin_checkout', 'purchase']
    const supabase = getSupabaseAdmin()
    const { count: pedidosRango } = await supabase
      .from('pedidos')
      .select('id', { count: 'exact', head: true })
      .in('estado', ESTADOS_VALIDOS)
      .gte('created_at', new Date(`${start}T05:00:00.000Z`).toISOString())

    const cantidadDe = (paso: string): number =>
      paso === 'purchase' ? (pedidosRango ?? 0) : (embudoMap.get(paso) ?? 0)

    const embudo: EmbudoPaso[] = pasos.map((paso, i) => {
      const actualPaso = cantidadDe(paso)
      const anterior = i > 0 ? cantidadDe(pasos[i - 1]) : actualPaso
      return {
        paso,
        etiqueta: EMBUDO_ETIQUETAS[paso],
        cantidad: actualPaso,
        pctPasoPrevio: i > 0 && anterior > 0 ? Math.round((actualPaso / anterior) * 1000) / 10 : null,
      }
    })

    return {
      configurada: true,
      ventana: `${etiquetaFecha(start)} – ${etiquetaFecha(end)}`,
      kpis: {
        vistas,
        deltaVistas: deltaPct(vistas, vistasPrev),
        usuarios,
        deltaUsuarios: deltaPct(usuarios, usuariosPrev),
        sesiones,
        deltaSesiones: deltaPct(sesiones, sesionesPrev),
        rebote: rebote !== null ? Math.round(rebote * 100) / 100 : null,
        deltaRebote:
          rebote !== null && rebotePrev !== null
            ? Math.round((rebotePrev - rebote) * 1000) / 10
            : null,
        duracionSeg: duracionAvg,
      },
      serie,
      topPaginas,
      fuentes: conConteo(fuentesRes, FUENTE_LABELS),
      dispositivos: conConteo(dispositivosRes, DEVICE_LABELS),
      paises: conConteo(paisesRes, {}),
      horas: horasRes
        .filter((f) => f.dimensiones[0] !== '(not set)')
        .map((f) => ({ hora: Number(f.dimensiones[0]), vistas: f.metricas[0] })),
      embudo,
      realtime: {
        vistas: realtimeRes.reduce((s, f) => s + f.metricas[0], 0),
        paginas: realtimeRes.map((f) => ({ ruta: f.dimensiones[0], vistas: f.metricas[0] })),
      },
    }
  } catch (e) {
    return {
      configurada: true,
      ventana: '',
      error: e instanceof Error ? e.message : String(e),
      kpis: { vistas: 0, deltaVistas: null, usuarios: 0, deltaUsuarios: null, sesiones: 0, deltaSesiones: null, rebote: null, deltaRebote: null, duracionSeg: null },
      serie: [],
      topPaginas: [],
      fuentes: [],
      dispositivos: [],
      paises: [],
      horas: [],
      embudo: [],
      realtime: { vistas: 0, paginas: [] },
    }
  }
}
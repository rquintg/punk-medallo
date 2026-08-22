import { findDepartamento } from './colombia'

export const ENVIO_GRATIS_UMBRAL = 150_000

export interface ZonaEnvio {
  id: string
  nombre: string
  tarifa: number
  diasMin: number
  diasMax: number
  departamentoIds: string[]
}

export const ZONAS_ENVIO: ZonaEnvio[] = [
  {
    id: 'zona-1',
    nombre: 'Antioquia',
    tarifa: 10_000,
    diasMin: 2,
    diasMax: 3,
    departamentoIds: ['05'],
  },
  {
    id: 'zona-2',
    nombre: 'Centro y norte',
    tarifa: 15_000,
    diasMin: 4,
    diasMax: 5,
    departamentoIds: [
      '11', // Bogotá D.C.
      '25', // Cundinamarca
      '76', // Valle del Cauca
      '08', // Atlántico
      '68', // Santander
      '17', // Caldas
      '66', // Risaralda
      '63', // Quindío
      '73', // Tolima
      '15', // Boyacá
      '50', // Meta
      '41', // Huila
    ],
  },
  {
    id: 'zona-3',
    nombre: 'Resto del país',
    tarifa: 20_000,
    diasMin: 6,
    diasMax: 8,
    departamentoIds: [],
  },
]

const TARIFA_RESTO = 20_000
const DIAS_RESTO: [number, number] = [6, 8]

function getTarifaEnvio(departamento: string | null | undefined): number {
  if (!departamento) return TARIFA_RESTO
  const found = findDepartamento(departamento)
  const zona = ZONAS_ENVIO.find((z) =>
    z.departamentoIds.includes(found?.id ?? ''),
  )
  return zona?.tarifa ?? TARIFA_RESTO
}

// Días hábiles estimados de entrega según la zona del departamento
// (se muestra como rango "X–Y días" en el seguimiento del pedido).
export function getDiasEntrega(
  departamento: string | null | undefined,
): [number, number] {
  if (!departamento) return DIAS_RESTO
  const found = findDepartamento(departamento)
  const zona = ZONAS_ENVIO.find((z) =>
    z.departamentoIds.includes(found?.id ?? ''),
  )
  return zona ? [zona.diasMin, zona.diasMax] : DIAS_RESTO
}

export function calcularEnvio(
  subtotal: number,
  departamento: string | null | undefined,
): number {
  if (subtotal >= ENVIO_GRATIS_UMBRAL) return 0
  return getTarifaEnvio(departamento)
}

export function calcularEnvioConConfig(
  subtotal: number,
  departamento: string | null | undefined,
  config: { envioGratisUmbral: number; envioTarifaAntioquia: number; envioTarifaCentro: number; envioTarifaResto: number },
): number {
  if (subtotal >= config.envioGratisUmbral) return 0
  if (!departamento) return config.envioTarifaResto
  const found = findDepartamento(departamento)
  const id = found?.id ?? ''
  if (id === '05') return config.envioTarifaAntioquia
  if (['11','25','76','08','68','17','66','63','73','15','50','41'].includes(id)) return config.envioTarifaCentro
  return config.envioTarifaResto
}

export function calcularRecargoConConfig(
  departamento: string | null | undefined,
  ciudad: string | null | undefined,
  config: { codRecargo: number; codMunicipios: string[] },
): number {
  if (!departamento || !ciudad) return 0
  const found = findDepartamento(departamento)
  if (found?.id !== '05') return 0
  const set = new Set(config.codMunicipios.map((m) => normalizarCiudad(m)))
  return set.has(normalizarCiudad(ciudad)) ? config.codRecargo : 0
}

// ---- Pago contra entrega (solo Medellín y área metropolitana) ----

export const CONTRa_ENTREGA_RECARGO = 5_000

// Municipios con pago contra entrega habilitado (normalizados sin tildes):
// Medellín, Bello, Itagüí, Envigado y Sabaneta
const AM_MUNICIPIOS = new Set([
  'medellin',
  'bello',
  'itagui',
  'envigado',
  'sabaneta',
])

function normalizarCiudad(ciudad: string | null | undefined): string {
  if (!ciudad) return ''
  const sinTildes = ciudad
    .toLowerCase()
    .replace(/[áä]/g, 'a')
    .replace(/[éë]/g, 'e')
    .replace(/[íï]/g, 'i')
    .replace(/[óö]/g, 'o')
    .replace(/[úü]/g, 'u')
    .replace(/ñ/g, 'n')
  return sinTildes.trim()
}

export function esContraEntregaDisponible(
  departamento: string | null | undefined,
  ciudad: string | null | undefined,
): boolean {
  if (!departamento || !ciudad) return false
  const found = findDepartamento(departamento)
  if (found?.id !== '05') return false
  return AM_MUNICIPIOS.has(normalizarCiudad(ciudad))
}

export function calcularRecargoContraEntrega(
  departamento: string | null | undefined,
  ciudad: string | null | undefined,
): number {
  return esContraEntregaDisponible(departamento, ciudad)
    ? CONTRa_ENTREGA_RECARGO
    : 0
}

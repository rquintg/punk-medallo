import { findDepartamento } from './colombia'

export const ENVIO_GRATIS_UMBRAL = 150_000

export interface ZonaEnvio {
  id: string
  nombre: string
  tarifa: number
  departamentoIds: string[]
}

export const ZONAS_ENVIO: ZonaEnvio[] = [
  {
    id: 'zona-1',
    nombre: 'Antioquia',
    tarifa: 10_000,
    departamentoIds: ['05'],
  },
  {
    id: 'zona-2',
    nombre: 'Centro y norte',
    tarifa: 15_000,
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
    departamentoIds: [],
  },
]

const TARIFA_RESTO = 20_000

export function getTarifaEnvio(departamento: string | null | undefined): number {
  if (!departamento) return TARIFA_RESTO
  const found = findDepartamento(departamento)
  const zona = ZONAS_ENVIO.find((z) =>
    z.departamentoIds.includes(found?.id ?? ''),
  )
  return zona?.tarifa ?? TARIFA_RESTO
}

export function calcularEnvio(
  subtotal: number,
  departamento: string | null | undefined,
): number {
  if (subtotal >= ENVIO_GRATIS_UMBRAL) return 0
  return getTarifaEnvio(departamento)
}

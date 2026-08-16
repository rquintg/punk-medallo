import type { AdminThemeEfectivo } from '@/features/admin/utils/use-admin-theme'

export const PALETA_PUNK = [
  '#dc2626',
  '#f59e0b',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#a855f7',
  '#ec4899',
  '#71717a',
]

export const PALETA_PUNK_LIGHT = [
  '#b91c1c',
  '#d97706',
  '#15803d',
  '#0e7490',
  '#1d4ed8',
  '#7c3aed',
  '#db2777',
  '#52525b',
]

export function paletaPunk(theme: AdminThemeEfectivo): string[] {
  return theme === 'light' ? PALETA_PUNK_LIGHT : PALETA_PUNK
}

export interface ChartThemeConfig {
  text: string
  textDim: string
  grid: string
  gridStrong: string
  tooltipBg: string
  tooltipBorder: string
  tooltipTitle: string
  tooltipBody: string
  accent: string
  accentSoft: string
}

export function temaEcharts(t: AdminThemeEfectivo): ChartThemeConfig {
  if (t === 'light') {
    return {
      text: '#3f3f46',
      textDim: '#a1a1aa',
      grid: 'rgba(63, 63, 70, 0.14)',
      gridStrong: 'rgba(63, 63, 70, 0.3)',
      tooltipBg: '#ffffff',
      tooltipBorder: '#e4e4e7',
      tooltipTitle: '#18181b',
      tooltipBody: '#52525b',
      accent: '#dc2626',
      accentSoft: 'rgba(220, 38, 38, 0.35)',
    }
  }
  return {
    text: '#a1a1aa',
    textDim: '#52525b',
    grid: 'rgba(255, 255, 255, 0.07)',
    gridStrong: 'rgba(255, 255, 255, 0.18)',
    tooltipBg: '#18181b',
    tooltipBorder: '#27272a',
    tooltipTitle: '#fafafa',
    tooltipBody: '#a1a1aa',
    accent: '#dc2626',
    accentSoft: 'rgba(220, 38, 38, 0.4)',
  }
}

export function formatearCOP(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) {
    const v = n / 1_000_000
    return `${v.toLocaleString('es-CO', { maximumFractionDigits: v >= 100 ? 0 : 1 })}M`
  }
  if (abs >= 1_000) {
    const v = n / 1_000
    return `${v.toLocaleString('es-CO', { maximumFractionDigits: v >= 100 ? 0 : 1 })}K`
  }
  return formatearCOPCompleto(n)
}

export const copCompleto = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

export function formatearCOPCompleto(n: number): string {
  return copCompleto.format(n)
}
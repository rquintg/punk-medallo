'use client'

import type { SerieDia } from '@/features/admin/services/dashboard'
import { useAdminTheme } from '@/features/admin/utils/use-admin-theme'
import EChart from './echart'
import { formatearCOP, formatearCOPCompleto, temaEcharts } from './chart-theme'

interface ChartIngresosProps {
  serie: SerieDia[]
}

export default function ChartIngresos({ serie }: ChartIngresosProps) {
  const theme = useAdminTheme()
  const t = temaEcharts(theme)

  const option = {
    grid: { left: 12, right: 12, top: 12, bottom: 4, containLabel: true },
    tooltip: {
      trigger: 'axis',
      backgroundColor: t.tooltipBg,
      borderColor: t.tooltipBorder,
      borderWidth: 1,
      padding: [10, 14],
      textStyle: { color: t.tooltipTitle, fontSize: 12 },
      formatter: (params: unknown) => {
        const lista = (Array.isArray(params) ? params : [params]) as {
          seriesName: string
          value: [string, number]
        }[]
        const primero = lista[0]
        if (!primero?.value) return ''
        let html = `<div style="font-weight:700;color:${t.tooltipTitle};margin-bottom:6px;">${primero.value[0]}</div>`
        for (const item of lista) {
          const valor = item.value?.[1] ?? 0
          html += `<div style="display:flex;align-items:center;gap:8px;font-size:12px;color:${t.tooltipBody};">
            <span style="width:8px;height:8px;border-radius:2px;background:${t.accent};display:inline-block;"></span>
            ${item.seriesName}: <b style="margin-left:4px;color:${t.tooltipTitle};">${formatearCOPCompleto(valor)}</b></div>`
        }
        return html
      },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: serie.map((d) => d.etiqueta),
      axisLine: { lineStyle: { color: t.gridStrong, width: 1 } },
      axisTick: { show: false },
      axisLabel: {
        color: t.textDim,
        fontSize: 11,
        interval: serie.length > 20 ? Math.floor(serie.length / 6) : 0,
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: t.textDim,
        fontSize: 11,
        formatter: (v: number) => formatearCOP(v),
      },
      splitLine: { lineStyle: { color: t.grid, type: 'dashed' } },
    },
    series: [
      {
        name: 'Ingresos',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        showSymbol: false,
        lineStyle: { color: t.accent, width: 2.5 },
        itemStyle: { color: t.accent },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: t.accentSoft },
              { offset: 1, color: 'rgba(220, 38, 38, 0) ' },
            ],
          },
        },
        data: serie.map((d) => [d.etiqueta, d.ingresos]),
      },
    ],
  }

  return (
    <EChart
      option={option}
      theme={theme}
      className="h-72 w-full"
      ariaLabel="Ingresos de los últimos días"
    />
  )
}
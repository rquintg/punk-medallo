'use client'

import type { SerieDia } from '@/features/admin/services/dashboard'
import { useAdminTheme } from '@/features/admin/utils/use-admin-theme'
import EChart from './echart'
import { temaEcharts } from './chart-theme'

interface ChartOrdenesDiaProps {
  serie: SerieDia[]
}

export default function ChartOrdenesDia({ serie }: ChartOrdenesDiaProps) {
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
          axisValue: string
          value: number
        }[]
        const primero = lista[0]
        if (primero == null) return ''
        return `<div style="font-weight:700;color:${t.tooltipTitle};margin-bottom:4px;">${primero.axisValue}</div>
          <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:${t.tooltipBody};">
          <span style="width:8px;height:8px;border-radius:2px;background:${t.accent};display:inline-block;"></span>
          Órdenes: <b style="margin-left:4px;color:${t.tooltipTitle};">${primero.value}</b></div>`
      },
    },
    xAxis: {
      type: 'category',
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
      minInterval: 1,
      axisLabel: { color: t.textDim, fontSize: 11 },
      splitLine: { lineStyle: { color: t.grid, type: 'dashed' } },
    },
    series: [
      {
        name: 'Órdenes',
        type: 'bar',
        barMaxWidth: 14,
        itemStyle: {
          color: t.accent,
          borderRadius: [4, 4, 0, 0],
          opacity: 0.85,
        },
        data: serie.map((d) => d.ordenes),
      },
    ],
  }

  return (
    <EChart
      option={option}
      theme={theme}
      className="h-64 w-full"
      ariaLabel="Órdenes por día"
    />
  )
}
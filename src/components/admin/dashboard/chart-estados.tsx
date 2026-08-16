'use client'

import { useAdminTheme } from '@/features/admin/utils/use-admin-theme'
import EChart from './echart'
import { temaEcharts } from './chart-theme'
import { ESTADO_COLORS, ESTADO_LABELS } from './estados'

export interface EstadoDato {
  estado: string
  count: number
}

interface ChartEstadosProps {
  data: EstadoDato[]
}

export default function ChartEstados({ data }: ChartEstadosProps) {
  const theme = useAdminTheme()
  const t = temaEcharts(theme)

  const ordenados = [...data].sort((a, b) => b.count - a.count)
  const visibles = ordenados.filter((d) => d.count > 0)

  const option = {
    grid: { left: 12, right: 24, top: 4, bottom: 4, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: t.tooltipBg,
      borderColor: t.tooltipBorder,
      borderWidth: 1,
      padding: [10, 14],
      textStyle: { color: t.tooltipTitle, fontSize: 12 },
      formatter: (params: unknown) => {
        const p = (Array.isArray(params) ? params[0] : params) as { name: string; value: number }
        if (!p) return ''
        return `<div style="font-weight:700;color:${t.tooltipTitle};margin-bottom:4px;">${p.name}</div>
          <div style="font-size:12px;color:${t.tooltipBody};">${p.value} pedido${p.value === 1 ? '' : 's'}</div>`
      },
    },
    xAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: { color: t.textDim, fontSize: 11 },
      splitLine: { lineStyle: { color: t.grid, type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: visibles.map((d) => ESTADO_LABELS[d.estado] ?? d.estado),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: t.text, fontSize: 12 },
    },
    series: [
      {
        name: 'Pedidos',
        type: 'bar',
        barMaxWidth: 14,
        itemStyle: { borderRadius: [0, 4, 4, 0] },
        data: visibles.map((d) => ({
          value: d.count,
          itemStyle: { color: ESTADO_COLORS[d.estado] ?? t.accent },
        })),
        label: {
          show: true,
          position: 'right',
          color: t.text,
          fontSize: 12,
          fontWeight: 700,
          formatter: '{c}',
        },
      },
    ],
  }

  return (
    <EChart
      option={option}
      theme={theme}
      className="h-64 w-full"
      ariaLabel="Órdenes por estado"
    />
  )
}
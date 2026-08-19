'use client'

import { useAdminTheme } from '@/features/admin/utils/use-admin-theme'
import EChart from './echart'
import { formatearCOP, paletaPunk, temaEcharts } from './chart-theme'

export interface DonutData {
  name: string
  value: number
}

interface ChartDonutProps {
  data: DonutData[]
  centerLabel: string
  money?: boolean
}

function formatearValor(n: number, money: boolean): string {
  return money ? formatearCOP(n) : n.toLocaleString('es-CO')
}

export default function ChartDonut({ data, centerLabel, money = true }: ChartDonutProps) {
  const theme = useAdminTheme()
  const t = temaEcharts(theme)

  const normalizado = data.filter((d) => d.value > 0)

  const option = {
    color: paletaPunk(theme),
    tooltip: {
      trigger: 'item',
      backgroundColor: t.tooltipBg,
      borderColor: t.tooltipBorder,
      borderWidth: 1,
      padding: [10, 14],
      textStyle: { color: t.tooltipTitle, fontSize: 12 },
      formatter: (params: unknown) => {
        const p = params as { name: string; value: number; percent: number }
        return `<div style="font-weight:700;color:${t.tooltipTitle};margin-bottom:4px;">${p.name}</div>
          <div style="font-size:12px;color:${t.tooltipBody};">${formatearValor(p.value, money)} · ${p.percent}%</div>`
      },
    },
    legend: {
      orient: 'vertical',
      right: 4,
      top: 'middle',
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 10,
      textStyle: { color: t.text, fontSize: 11 },
      formatter: (name: string) => (name.length > 18 ? `${name.slice(0, 17)}…` : name),
    },
    series: [
      {
        name: centerLabel,
        type: 'pie',
        radius: ['62%', '82%'],
        center: ['36%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 4, borderColor: 'transparent', borderWidth: 0 },
        label: { show: false },
        emphasis: {
          label: { show: false },
          scaleSize: 4,
        },
        data: normalizado.map((d) => ({ name: d.name, value: d.value })),
      },
    ],
    graphic: [
      {
        type: 'text',
        left: '36%',
        top: '44%',
        style: {
          text: centerLabel,
          textAlign: 'center',
          fontSize: 11,
          fontWeight: 600,
          fill: t.textDim,
        },
      },
      {
        type: 'text',
        left: '36%',
        top: '54%',
        style: {
          text: formatearValor(normalizado.reduce((s, d) => s + d.value, 0), money),
          textAlign: 'center',
          fontSize: 14,
          fontWeight: 700,
          fill: t.text,
        },
      },
    ],
  }

  return (
    <EChart
      option={option}
      theme={theme}
      className="h-64 w-full"
      ariaLabel={`${centerLabel}: ${normalizado.map((d) => `${d.name} ${formatearValor(d.value, money)}`).join(', ')}`}
    />
  )
}
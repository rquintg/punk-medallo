'use client'

import { useEffect, useState } from 'react'
import {
  Eye,
  Users,
  MousePointerClick,
  Timer,
  TrendingUp,
  Globe,
  MonitorSmartphone,
  MapPin,
  ArrowDownUp,
  Settings2,
  Clock5,
} from 'lucide-react'
import type { AnaliticaReportes, ConteoAnalitica } from '@/features/admin/services/analitica'
import { AYUDA_ANALITICA } from '@/features/admin/services/analitica-ayuda'
import type { RangoDias } from '@/features/admin/services/dashboard'
import KpiCard from '@/components/admin/dashboard/kpi-card'
import DashboardCard from '@/components/admin/dashboard/dashboard-card'
import ChartDonut from '@/components/admin/dashboard/chart-donut'
import EmptyChart from '@/components/admin/dashboard/empty-chart'
import { temaEcharts, paletaPunk } from '@/components/admin/dashboard/chart-theme'
import { useAdminTheme } from '@/features/admin/utils/use-admin-theme'
import EChart from '@/components/admin/dashboard/echart'

interface AnaliticaContentProps {
  reportes: AnaliticaReportes
  rango: RangoDias
}

function TraficoChart({ reportes }: { reportes: AnaliticaReportes }) {
  const theme = useAdminTheme()
  const t = temaEcharts(theme)
  const serie = reportes.serie

  const option = {
    color: paletaPunk(theme),
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
          color?: string
        }[]
        const primero = lista[0]
        if (!primero?.value) return ''
        let html = `<div style="font-weight:700;color:${t.tooltipTitle};margin-bottom:6px;">${primero.value[0]}</div>`
        for (const item of lista) {
          const valor = item.value?.[1] ?? 0
          html += `<div style="display:flex;align-items:center;gap:8px;font-size:12px;color:${t.tooltipBody};">
            <span style="width:8px;height:8px;border-radius:2px;background:${item.color ?? t.accent};display:inline-block;"></span>
            ${item.seriesName}: <b style="margin-left:4px;color:${t.tooltipTitle};">${valor.toLocaleString('es-CO')}</b></div>`
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
      axisLabel: { color: t.textDim, fontSize: 11 },
      splitLine: { lineStyle: { color: t.grid, type: 'dashed' } },
    },
    series: [
      {
        name: 'Vistas',
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
              { offset: 1, color: 'rgba(220, 38, 38, 0)' },
            ],
          },
        },
        data: serie.map((d) => [d.etiqueta, d.vistas]),
      },
      {
        name: 'Usuarios',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        showSymbol: false,
        lineStyle: { color: '#22c55e', width: 2 },
        itemStyle: { color: '#22c55e' },
        data: serie.map((d) => [d.etiqueta, d.usuarios]),
      },
    ],
  }

  return (
    <EChart
      option={option}
      theme={theme}
      className="h-72 w-full"
      ariaLabel="Vistas y usuarios por día"
    />
  )
}

function HorasChart({ reportes, rango }: { reportes: AnaliticaReportes; rango: RangoDias }) {
  const theme = useAdminTheme()
  const t = temaEcharts(theme)
  const horas = reportes.horas
  const [modo, setModo] = useState<'promedio' | 'total'>('total')

  const mostrar = (vistas: number) =>
    modo === 'promedio' ? Math.round(vistas / rango) : vistas

  const data = Array.from({ length: 24 }, (_, hora) => {
    const encontrado = horas.find((h) => h.hora === hora)
    return { hora, vistas: mostrar(encontrado?.vistas ?? 0) }
  })

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
        const p = (Array.isArray(params) ? params : [params]) as {
          value: [string, number]
        }[]
        const primero = p[0]
        if (!primero?.value) return ''
        const hora = Number(primero.value[0])
        return `<div style="font-weight:700;color:${t.tooltipTitle};margin-bottom:4px;">${String(hora).padStart(2, '0')}:00</div>
          <div style="font-size:12px;color:${t.tooltipBody};">${modo === 'promedio' ? 'Promedio por día' : 'Total en la ventana'}: <b style="color:${t.tooltipTitle};">${primero.value[1].toLocaleString('es-CO')}</b></div>`
      },
    },
    xAxis: {
      type: 'category',
      data: data.map((d) => String(d.hora).padStart(2, '0')),
      axisLine: { lineStyle: { color: t.gridStrong, width: 1 } },
      axisTick: { show: false },
      axisLabel: { color: t.textDim, fontSize: 10, interval: 3 },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: t.textDim, fontSize: 11 },
      splitLine: { lineStyle: { color: t.grid, type: 'dashed' } },
    },
    series: [
      {
        name: 'Vistas',
        type: 'bar',
        barMaxWidth: 22,
        itemStyle: {
          color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [
            { offset: 0, color: t.accent },
            { offset: 1, color: t.accentSoft },
          ] },
          borderRadius: [3, 3, 0, 0],
        },
        data: data.map((d) => [String(d.hora).padStart(2, '0'), d.vistas]),
      },
    ],
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <HorasToggle modo={modo} onModo={setModo} />
      </div>
      <EChart
        option={option}
        theme={theme}
        className="h-64 w-full"
        ariaLabel="Vistas por hora del día"
      />
    </div>
  )
}

function HorasToggle({
  modo,
  onModo,
}: {
  modo: 'promedio' | 'total'
  onModo: (m: 'promedio' | 'total') => void
}) {
  const opciones: { valor: 'promedio' | 'total'; etiqueta: string }[] = [
    { valor: 'promedio', etiqueta: 'Promedio por día' },
    { valor: 'total', etiqueta: 'Total' },
  ]
  return (
    <div
      role="group"
      aria-label="Modo del gráfico de horas"
      className="inline-flex items-center gap-1 rounded-lg border border-[var(--admin-card-border)] bg-[var(--admin-card)] p-1"
    >
      {opciones.map((op) => {
        const activo = modo === op.valor
        return (
          <button
            key={op.valor}
            type="button"
            onClick={() => onModo(op.valor)}
            aria-pressed={activo}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activo
                ? 'bg-[var(--admin-accent)] text-white'
                : 'text-[var(--admin-text-muted)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-text)]'
            }`}
          >
            {op.etiqueta}
          </button>
        )
      })}
    </div>
  )
}

function PaisesChart({ reportes }: { reportes: AnaliticaReportes }) {
  const [modo, setModo] = useState<'vistas' | 'usuarios'>('vistas')

  const valor = (p: ConteoAnalitica) => (modo === 'usuarios' ? (p.usuarios ?? 0) : p.vista)

  const datos = [...reportes.paises]
    .map((p) => ({ name: p.nombre, value: valor(p) }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <PaisesToggle modo={modo} onModo={setModo} />
      </div>
      {datos.length > 0 ? (
        <ChartDonut data={datos} centerLabel="Países" money={false} />
      ) : (
        <EmptyChart />
      )}
    </div>
  )
}

function PaisesToggle({
  modo,
  onModo,
}: {
  modo: 'vistas' | 'usuarios'
  onModo: (m: 'vistas' | 'usuarios') => void
}) {
  const opciones: { valor: 'vistas' | 'usuarios'; etiqueta: string }[] = [
    { valor: 'vistas', etiqueta: 'Vistas' },
    { valor: 'usuarios', etiqueta: 'Usuarios' },
  ]
  return (
    <div
      role="group"
      aria-label="Modo del gráfico de países"
      className="inline-flex items-center gap-1 rounded-lg border border-[var(--admin-card-border)] bg-[var(--admin-card)] p-1"
    >
      {opciones.map((op) => {
        const activo = modo === op.valor
        return (
          <button
            key={op.valor}
            type="button"
            onClick={() => onModo(op.valor)}
            aria-pressed={activo}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activo
                ? 'bg-[var(--admin-accent)] text-white'
                : 'text-[var(--admin-text-muted)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-text)]'
            }`}
          >
            {op.etiqueta}
          </button>
        )
      })}
    </div>
  )
}

function FuentesChart({ reportes }: { reportes: AnaliticaReportes }) {
  const [modo, setModo] = useState<'vistas' | 'sesiones'>('vistas')

  const valor = (f: ConteoAnalitica) => (modo === 'sesiones' ? (f.sesiones ?? 0) : f.vista)

  const datos = [...reportes.fuentes]
    .map((f) => ({ name: f.nombre, value: valor(f) }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <FuentesToggle modo={modo} onModo={setModo} />
      </div>
      {datos.length > 0 ? (
        <ChartDonut data={datos} centerLabel="Fuentes" money={false} />
      ) : (
        <EmptyChart />
      )}
    </div>
  )
}

function FuentesToggle({
  modo,
  onModo,
}: {
  modo: 'vistas' | 'sesiones'
  onModo: (m: 'vistas' | 'sesiones') => void
}) {
  const opciones: { valor: 'vistas' | 'sesiones'; etiqueta: string }[] = [
    { valor: 'vistas', etiqueta: 'Vistas' },
    { valor: 'sesiones', etiqueta: 'Sesiones' },
  ]
  return (
    <div
      role="group"
      aria-label="Modo del gráfico de fuentes"
      className="inline-flex items-center gap-1 rounded-lg border border-[var(--admin-card-border)] bg-[var(--admin-card)] p-1"
    >
      {opciones.map((op) => {
        const activo = modo === op.valor
        return (
          <button
            key={op.valor}
            type="button"
            onClick={() => onModo(op.valor)}
            aria-pressed={activo}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activo
                ? 'bg-[var(--admin-accent)] text-white'
                : 'text-[var(--admin-text-muted)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-text)]'
            }`}
          >
            {op.etiqueta}
          </button>
        )
      })}
    </div>
  )
}

function Embudo({ reportes }: { reportes: AnaliticaReportes }) {
  const embudo = reportes.embudo
  if (embudo.length === 0) return <EmptyChart title="Sin eventos de ecommerce todavía" />

  const max = Math.max(...embudo.map((e) => e.cantidad), 1)

  return (
    <div className="space-y-4">
      {embudo.map((paso) => (
        <div key={paso.paso}>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-medium text-[var(--admin-text)]">{paso.etiqueta}</span>
            <span className="tabular-nums text-[var(--admin-text-muted)]">
              {paso.cantidad.toLocaleString('es-CO')}
              {paso.pctPasoPrevio !== null && (
                <span className="ml-2 text-xs text-[var(--admin-text-dim)]">
                  {paso.pctPasoPrevio}% del paso anterior
                </span>
              )}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-[var(--admin-hover)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--admin-accent)] to-[var(--admin-accent)]/60"
              style={{ width: `${Math.max((paso.cantidad / max) * 100, 2)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function TopPaginas({ reportes }: { reportes: AnaliticaReportes }) {
  const paginas = reportes.topPaginas
  if (paginas.length === 0) {
    return <EmptyChart title="Sin páginas con vistas en el rango" />
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--admin-card-border)]">
            <th className="px-2 py-2.5 text-left font-medium text-[var(--admin-text-muted)]">Página</th>
            <th className="px-2 py-2.5 text-right font-medium text-[var(--admin-text-muted)]">Vistas</th>
            <th className="px-2 py-2.5 text-right font-medium text-[var(--admin-text-muted)]">%</th>
          </tr>
        </thead>
        <tbody>
          {paginas.map((p, i) => (
            <tr key={p.ruta} className="border-b border-[var(--admin-card-border)] transition-colors hover:bg-[var(--admin-hover)]">
              <td className="max-w-[280px] truncate px-2 py-2.5 font-mono text-xs text-[var(--admin-text)]">
                <span className="mr-2 text-xs text-[var(--admin-text-dim)]">{i + 1}.</span>
                {p.ruta}
              </td>
              <td className="px-2 py-2.5 text-right tabular-nums text-[var(--admin-text)]">
                {p.vistas.toLocaleString('es-CO')}
              </td>
              <td className="px-2 py-2.5 text-right tabular-nums text-[var(--admin-text-muted)]">
                {p.pct}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RealtimeLive({ initial }: { initial: AnaliticaReportes['realtime'] }) {
  const [data, setData] = useState(initial)

  useEffect(() => {
    let activo = true
    const cargar = async () => {
      try {
        const res = await fetch('/api/analitica/realtime', { cache: 'no-store' })
        if (!res.ok) return
        const json = (await res.json()) as { vistas?: number; paginas?: { ruta: string; vistas: number }[] }
        if (activo && typeof json.vistas === 'number' && Array.isArray(json.paginas)) {
          setData({ vistas: json.vistas, paginas: json.paginas })
        }
      } catch {
        // mantener el último dato si la red falla
      }
    }
    cargar()
    const id = setInterval(cargar, 60_000)
    return () => {
      activo = false
      clearInterval(id)
    }
  }, [])

  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--admin-text-muted)]">
        Vistas últimos 30 min
        <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
        <span className="normal-case tracking-normal">en vivo</span>
      </p>
      <p className="mt-2 text-3xl font-bold tabular-nums text-[var(--admin-text)]">
        {data.vistas.toLocaleString('es-CO')}
      </p>

      {data.paginas.length > 0 && (
        <div className="mt-4 space-y-2">
          {data.paginas.slice(0, 5).map((p) => (
            <div key={p.ruta} className="flex items-center justify-between gap-3 text-xs">
              <span className="max-w-[220px] truncate font-mono text-[var(--admin-text-muted)]">
                {p.ruta}
              </span>
              <span className="tabular-nums font-semibold text-[var(--admin-text)]">
                {p.vistas}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AnaliticaContent({ reportes, rango }: AnaliticaContentProps) {
  if (!reportes.configurada) {
    return (
      <div className="mx-auto max-w-xl">
        <DashboardCard icon={Settings2} title="Analítica sin configurar">
          <div className="space-y-3 text-sm leading-relaxed text-[var(--admin-text-muted)]">
            <p>Para activar la analítica necesitás dos variables de entorno:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <code className="rounded bg-[var(--admin-hover)] px-1.5 py-0.5 font-mono text-xs text-[var(--admin-accent)]">
                  GA4_PROPERTY_ID
                </code>{' '}
                — el ID numérico de tu propiedad de Google Analytics 4.
              </li>
              <li>
                <code className="rounded bg-[var(--admin-hover)] px-1.5 py-0.5 font-mono text-xs text-[var(--admin-accent)]">
                  GA4_SERVICE_ACCOUNT_JSON
                </code>{' '}
                — el JSON de la service account con acceso Viewer a la propiedad.
              </li>
            </ul>
            <p>Agregalas en tu archivo .env.local para desarrollo y en Vercel para producción.</p>
          </div>
        </DashboardCard>
      </div>
    )
  }

  if (reportes.error) {
    return (
      <div className="mx-auto max-w-xl">
        <DashboardCard icon={Settings2} title="Error consultando GA4">
          <div className="space-y-3 text-sm leading-relaxed text-[var(--admin-text-muted)]">
            <p>
              La consulta a Google Analytics falló. Checkeá que la service account tenga acceso{' '}
              <b className="text-[var(--admin-text)]">Viewer</b> a la propiedad y que el{' '}
              <code className="rounded bg-[var(--admin-hover)] px-1.5 py-0.5 font-mono text-xs text-[var(--admin-accent)]">
                GA4_PROPERTY_ID
              </code>{' '}
              sea correcto.
            </p>
            <p className="break-words rounded-lg bg-[var(--admin-hover)] p-3 font-mono text-xs text-[var(--admin-text-muted)]">
              {reportes.error}
            </p>
          </div>
        </DashboardCard>
      </div>
    )
  }

  const etiqueta = { 7: 'Últimos 7 días', 30: 'Últimos 30 días', 90: 'Últimos 90 días' }[rango]
  const conTrafico = reportes.kpis.vistas > 0
  const duracionMin = reportes.kpis.duracionSeg !== null
    ? Math.round(reportes.kpis.duracionSeg / 60)
    : null
  const duracionSeg = reportes.kpis.duracionSeg

  return (
    <>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          label={`Vistas · ${etiqueta}`}
          value={reportes.kpis.vistas}
          icon={Eye}
          color="red"
          delta={reportes.kpis.deltaVistas}
          sub={reportes.ventana || undefined}
          help={AYUDA_ANALITICA.vistas}
        />
        <KpiCard
          label="Usuarios únicos"
          value={reportes.kpis.usuarios}
          icon={Users}
          color="blue"
          delta={reportes.kpis.deltaUsuarios}
          help={AYUDA_ANALITICA.usuarios}
        />
        <KpiCard
          label="Sesiones"
          value={reportes.kpis.sesiones}
          icon={MousePointerClick}
          color="zinc"
          delta={reportes.kpis.deltaSesiones}
          help={AYUDA_ANALITICA.sesiones}
        />
        <KpiCard
          label="Rebote"
          value={reportes.kpis.rebote ?? 0}
          icon={ArrowDownUp}
          color="amber"
          suffix="%"
          delta={reportes.kpis.deltaRebote}
          sub="abandonos sin interacción"
          help={AYUDA_ANALITICA.rebote}
        />
        <KpiCard
          label="Duración media"
          value={duracionMin ?? 0}
          icon={Timer}
          color="green"
          suffix="min"
          sub={duracionSeg !== null ? `${duracionSeg}s en promedio` : undefined}
          help={AYUDA_ANALITICA.duracion}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <DashboardCard icon={TrendingUp} title="Tráfico por día" help={AYUDA_ANALITICA.trafico}>
            {conTrafico ? <TraficoChart reportes={reportes} /> : <EmptyChart />}
          </DashboardCard>
        </div>

        <div className="lg:col-span-4">
          <DashboardCard icon={MapPin} title="Últimos 30 minutos" help={AYUDA_ANALITICA.realtime}>
            <RealtimeLive initial={reportes.realtime} />
          </DashboardCard>
        </div>

        <div className="lg:col-span-4">
          <DashboardCard icon={Globe} title="Fuentes de tráfico" help={AYUDA_ANALITICA.fuentes}>
            {reportes.fuentes.length > 0 ? (
              <FuentesChart reportes={reportes} />
            ) : (
              <EmptyChart />
            )}
          </DashboardCard>
        </div>

        <div className="lg:col-span-4">
          <DashboardCard icon={MonitorSmartphone} title="Dispositivos" help={AYUDA_ANALITICA.dispositivos}>
            {reportes.dispositivos.length > 0 ? (
              <ChartDonut
                data={reportes.dispositivos.map((d) => ({ name: d.nombre, value: d.vista }))}
                centerLabel="Dispositivos"
                money={false}
              />
            ) : (
              <EmptyChart />
            )}
          </DashboardCard>
        </div>

        <div className="lg:col-span-4">
          <DashboardCard icon={Globe} title="Países" help={AYUDA_ANALITICA.paises}>
            {reportes.paises.length > 0 ? (
              <PaisesChart reportes={reportes} />
            ) : (
              <EmptyChart />
            )}
          </DashboardCard>
        </div>

        <div className="lg:col-span-5">
          <DashboardCard icon={Clock5} title="Vistas por hora" help={AYUDA_ANALITICA.horas}>
            {reportes.horas.length > 0 ? (
              <HorasChart reportes={reportes} rango={rango} />
            ) : (
              <EmptyChart />
            )}
          </DashboardCard>
        </div>

        <div className="lg:col-span-7">
          <DashboardCard icon={ArrowDownUp} title="Top páginas" help={AYUDA_ANALITICA.topPaginas}>
            <TopPaginas reportes={reportes} />
          </DashboardCard>
        </div>

        <div className="lg:col-span-12">
          <DashboardCard
            icon={ArrowDownUp}
            title="Embudo de compra"
            help={AYUDA_ANALITICA.embudo}
            right={
              <span className="text-xs text-[var(--admin-text-dim)]">
                último paso (compras) desde pedidos
              </span>
            }
          >
            <Embudo reportes={reportes} />
          </DashboardCard>
        </div>
      </div>
    </>
  )
}
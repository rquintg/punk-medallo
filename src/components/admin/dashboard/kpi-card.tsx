import type { LucideIcon } from 'lucide-react'
import { formatearCOPCompleto } from './chart-theme'

interface KpiCardProps {
  label: string
  value: number
  icon: LucideIcon
  color?: 'green' | 'blue' | 'amber' | 'red' | 'zinc'
  money?: boolean
  delta?: number | null
  sub?: string
  suffix?: string
}

const COLOR_STYLES: Record<string, { caja: string; icono: string }> = {
  green: { caja: 'bg-emerald-500/10', icono: 'text-emerald-400' },
  blue: { caja: 'bg-blue-500/10', icono: 'text-blue-400' },
  amber: { caja: 'bg-amber-500/10', icono: 'text-amber-400' },
  red: { caja: 'bg-red-500/10', icono: 'text-red-400' },
  zinc: { caja: 'bg-neutral-500/10', icono: 'text-neutral-400' },
}

export default function KpiCard({
  label,
  value,
  icon: Icon,
  color = 'zinc',
  money = false,
  delta = null,
  sub,
  suffix,
}: KpiCardProps) {
  const estilos = COLOR_STYLES[color]

  return (
    <div className="bg-[var(--admin-card)] border border-[var(--admin-card-border)] rounded-xl p-5 transition-colors hover:border-[var(--admin-card-border)]/80">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--admin-text-muted)]">
          {label}
        </p>
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${estilos.caja}`}>
          <Icon size={16} className={estilos.icono} />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums text-[var(--admin-text)]">
        {money ? formatearCOPCompleto(value) : value.toLocaleString('es-CO')}
        {suffix && <span className="text-lg font-semibold text-[var(--admin-text-muted)]">{suffix}</span>}
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        {delta !== null && (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
              delta >= 0
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-red-500/10 text-red-400'
            }`}
          >
            {delta >= 0 ? '+' : '−'}
            {Math.abs(delta)}%
          </span>
        )}
        {sub && <p className="text-xs text-[var(--admin-text-dim)]">{sub}</p>}
      </div>
    </div>
  )
}
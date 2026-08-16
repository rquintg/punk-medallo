import { BarChart3 } from 'lucide-react'

interface EmptyChartProps {
  title?: string
}

export default function EmptyChart({ title = 'Sin datos todavía' }: EmptyChartProps) {
  return (
    <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-lg border border-dashed border-[var(--admin-card-border)]">
      <div className="pointer-events-none absolute inset-0 select-none opacity-[0.35] blur-[2px]">
        <div className="absolute left-0 right-0 top-0 h-1/2 bg-gradient-to-b from-[var(--admin-accent)]/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-[var(--admin-card-border)]" />
        <div className="mt-4 space-y-2 px-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-8 rounded-lg bg-[var(--admin-hover)]" style={{ width: `${92 - i * 15}%` }} />
          ))}
        </div>
      </div>
      <div className="relative z-10 flex flex-col items-center gap-2 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--admin-hover)] text-[var(--admin-text-dim)]">
          <BarChart3 size={18} />
        </span>
        <p className="text-sm font-medium text-[var(--admin-text-muted)]">{title}</p>
      </div>
    </div>
  )
}
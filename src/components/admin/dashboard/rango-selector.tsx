'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { RANGOS, type RangoDias } from '@/features/admin/services/dashboard'

const LABELS: Record<RangoDias, string> = {
  7: '7 días',
  30: '30 días',
  90: '90 días',
}

export default function RangoSelector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rango = (Number(searchParams.get('rango')) as RangoDias) in LABELS
    ? (Number(searchParams.get('rango')) as RangoDias)
    : 30

  return (
    <div
      role="group"
      aria-label="Rango de fechas"
      className="inline-flex items-center gap-1 rounded-lg border border-[var(--admin-card-border)] bg-[var(--admin-card)] p-1"
    >
      {RANGOS.map((valor) => {
        const activo = rango === valor
        return (
          <button
            key={valor}
            type="button"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString())
              params.delete('page')
              params.set('rango', String(valor))
              router.replace(`/admin/dashboard?${params.toString()}`, { scroll: false })
            }}
            aria-pressed={activo}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activo
                ? 'bg-[var(--admin-accent)] text-white'
                : 'text-[var(--admin-text-muted)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-text)]'
            }`}
          >
            {LABELS[valor]}
          </button>
        )
      })}
    </div>
  )
}
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { X } from 'lucide-react'

interface BoletasFiltersProps {
  meses: { value: string; label: string }[]
  lugares: string[]
}

export function BoletasFilters({ meses, lugares }: BoletasFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeMes = searchParams.get('mes') ?? ''
  const activeLugar = searchParams.get('lugar') ?? ''
  const disponiblesOnly = searchParams.get('disponibles') === '1'

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (!value) params.delete(key)
      else params.set(key, value)
      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams],
  )

  const hasFilters = !!activeMes || !!activeLugar || disponiblesOnly

  return (
    <div className="space-y-6">
      {/* Mes */}
      {meses.length > 0 && (
        <div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-neutral-500">Mes</p>
          <select
            value={activeMes}
            onChange={(e) => updateParam('mes', e.target.value)}
            className="w-full rounded-md border border-neutral-700 bg-[#181818] px-3 py-2 text-sm text-white outline-none focus:border-[#dc2626]"
          >
            <option value="">Todos</option>
            {meses.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Lugar */}
      {lugares.length > 0 && (
        <div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-neutral-500">Lugar</p>
          <select
            value={activeLugar}
            onChange={(e) => updateParam('lugar', e.target.value)}
            className="w-full rounded-md border border-neutral-700 bg-[#181818] px-3 py-2 text-sm text-white outline-none focus:border-[#dc2626]"
          >
            <option value="">Todos</option>
            {lugares.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Solo disponibles */}
      <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-300">
        <input
          type="checkbox"
          checked={disponiblesOnly}
          onChange={(e) => updateParam('disponibles', e.target.checked ? '1' : '')}
          className="h-4 w-4 rounded border-neutral-700 bg-[#181818] accent-[#dc2626]"
        />
        Solo disponibles
      </label>

      {/* Chips activos */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {activeMes && (
            <button
              type="button"
              onClick={() => updateParam('mes', '')}
              className="inline-flex items-center gap-1 rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1 text-xs text-white hover:border-[#dc2626]"
            >
              {meses.find((m) => m.value === activeMes)?.label ?? activeMes}
              <X size={12} />
            </button>
          )}
          {activeLugar && (
            <button
              type="button"
              onClick={() => updateParam('lugar', '')}
              className="inline-flex items-center gap-1 rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1 text-xs text-white hover:border-[#dc2626]"
            >
              {activeLugar}
              <X size={12} />
            </button>
          )}
          {disponiblesOnly && (
            <button
              type="button"
              onClick={() => updateParam('disponibles', '')}
              className="inline-flex items-center gap-1 rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1 text-xs text-white hover:border-[#dc2626]"
            >
              Solo disponibles
              <X size={12} />
            </button>
          )}
        </div>
      )}

      {hasFilters && (
        <button
          type="button"
          onClick={() => router.replace('/boletas', { scroll: false })}
          className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-widest text-[#dc2626] hover:text-white"
        >
          <X size={12} />
          Limpiar filtros
        </button>
      )}
    </div>
  )
}

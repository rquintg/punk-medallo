'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { useMemo, useState, useTransition } from 'react'
import { formatBogota } from '@/lib/format-bogota'

export default function ReporteFilters({
  eventos,
  defaultEvento,
  defaultEstado,
  defaultQ,
}: {
  eventos: Array<{ id: string; titulo: string; fechaEvento: string }>
  defaultEvento: string
  defaultEstado: string
  defaultQ: string
}) {
  const router = useRouter()
  const sp = useSearchParams()
  const [q, setQ] = useState(defaultQ)
  const [isPending, startTransition] = useTransition()
  const opciones = useMemo(
    () =>
      eventos.map((e) => ({
        id: e.id,
        label: `${e.titulo} — ${formatBogota(e.fechaEvento, { day: '2-digit', month: 'short', year: 'numeric' })}`,
      })),
    [eventos],
  )

  function push(params: Record<string, string>) {
    const next = new URLSearchParams(sp.toString())
    for (const [k, v] of Object.entries(params)) {
      if (v) next.set(k, v)
      else next.delete(k)
    }
    if ('evento' in params || 'estado' in params || 'q' in params) next.delete('page')
    startTransition(() => router.push(`?${next.toString()}`))
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="min-w-[220px] flex-1 sm:max-w-[320px]">
        <label className="label">Evento</label>
        <select
          value={defaultEvento}
          onChange={(e) => push({ evento: e.target.value })}
          className="input"
        >
          <option value="">Selecciona un evento</option>
          {opciones.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full sm:w-[160px]">
        <label className="label">Estado</label>
        <select
          value={defaultEstado}
          onChange={(e) => push({ estado: e.target.value })}
          className="input"
          disabled={!defaultEvento}
        >
          <option value="todos">Todos (incluye anuladas)</option>
          <option value="valida">Valida (sin usar)</option>
          <option value="usada">Usada</option>
          <option value="anulada">Anulada</option>
        </select>
      </div>

      <div className="flex-1 sm:max-w-[260px]">
        <label className="label">Buscar</label>
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-dim)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') push({ q: q.trim() })
            }}
            onBlur={() => push({ q: q.trim() })}
            placeholder="Código, titular, email..."
            className="input pl-9"
            disabled={!defaultEvento}
          />
        </div>
      </div>

      {isPending && <span className="text-xs text-[var(--admin-text-dim)]">Actualizando...</span>}
    </div>
  )
}

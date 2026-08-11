'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

const ESTADOS = ['', 'pendiente', 'aprobado', 'preparando', 'enviado', 'entregado', 'rechazado', 'cancelado', 'anulado', 'error']

const LABELS: Record<string, string> = {
  '': 'Todas',
  pendiente: 'Pendiente',
  aprobado: 'Aprobado',
  preparando: 'En preparación',
  enviado: 'Enviado',
  entregado: 'Entregado',
  rechazado: 'Rechazado',
  cancelado: 'Cancelado',
  anulado: 'Anulado',
  error: 'Error',
}

export default function FiltroEstado() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const current = searchParams.get('estado') ?? ''

  function select(estado: string) {
    const next = new URLSearchParams(searchParams)
    if (estado) {
      next.set('estado', estado)
    } else {
      next.delete('estado')
    }
    next.delete('page')
    router.push(`${pathname}?${next.toString()}`)
  }

  return (
    <div className="flex items-center gap-2 mb-6 flex-wrap">
      {ESTADOS.map((estado) => (
        <button
          key={estado}
          onClick={() => select(estado)}
          aria-pressed={current === estado}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            current === estado
              ? 'bg-[var(--admin-accent)] text-white'
              : 'bg-[var(--admin-card)] border border-[var(--admin-card-border)] text-[var(--admin-text-muted)] hover:bg-[var(--admin-hover)]'
          }`}
        >
          {LABELS[estado]}
        </button>
      ))}
    </div>
  )
}

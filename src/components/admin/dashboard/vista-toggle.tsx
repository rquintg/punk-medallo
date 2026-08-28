'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Store, Ticket } from 'lucide-react'

export type VistaDashboard = 'tienda' | 'boleteria'

export default function VistaToggle({ vista }: { vista: VistaDashboard }) {
  const router = useRouter()
  const sp = useSearchParams()

  function setVista(next: VistaDashboard) {
    const params = new URLSearchParams(sp.toString())
    params.set('vista', next)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="inline-flex rounded-lg border border-[var(--admin-card-border)] bg-[var(--admin-card)] p-1">
      <button
        type="button"
        onClick={() => setVista('tienda')}
        aria-pressed={vista === 'tienda'}
        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          vista === 'tienda'
            ? 'bg-[var(--admin-accent)] text-white shadow'
            : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]'
        }`}
      >
        <Store size={14} /> Tienda
      </button>
      <button
        type="button"
        onClick={() => setVista('boleteria')}
        aria-pressed={vista === 'boleteria'}
        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          vista === 'boleteria'
            ? 'bg-[var(--admin-accent)] text-white shadow'
            : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]'
        }`}
      >
        <Ticket size={14} /> Boletería
      </button>
    </div>
  )
}

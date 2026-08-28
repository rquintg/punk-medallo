'use client'

import { Download } from 'lucide-react'

export default function ExportButton({ eventoId, disabled }: { eventoId: string; disabled?: boolean }) {
  if (!eventoId || disabled) {
    return (
      <button disabled className="inline-flex items-center gap-2 rounded-lg border border-[var(--admin-card-border)] bg-[var(--admin-card-bg)] px-4 py-2 text-sm font-medium text-[var(--admin-text-dim)] opacity-60">
        <Download size={16} /> Exportar CSV
      </button>
    )
  }
  return (
    <a
      href={`/api/admin/boletas/export?eventoId=${eventoId}`}
      download
      className="inline-flex items-center gap-2 rounded-lg bg-[var(--admin-accent)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
    >
      <Download size={16} /> Exportar CSV (Sheets)
    </a>
  )
}

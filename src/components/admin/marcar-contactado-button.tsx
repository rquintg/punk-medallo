'use client'

import { useTransition } from 'react'
import { Check } from 'lucide-react'
import { toast } from 'sonner'
import { marcarAvisoContactado } from '@/features/admin/actions/avisos'

export default function MarcarContactadoButton({ avisoId }: { avisoId: string }) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      try {
        await marcarAvisoContactado(avisoId)
        toast.success('Aviso marcado como contactado')
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Error al marcar')
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="shrink-0 rounded-md border border-[var(--admin-card-border)] bg-[var(--admin-hover)] px-2.5 py-1 text-[11px] font-semibold text-[var(--admin-text-muted)] transition-colors hover:border-emerald-500/30 hover:text-emerald-400 disabled:opacity-50"
    >
      <span className="inline-flex items-center gap-1">
        <Check size={11} />
        {pending ? '…' : 'Marcar contactado'}
      </span>
    </button>
  )
}
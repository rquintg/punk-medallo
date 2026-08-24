'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { confirmDialog } from '@/components/admin/confirm-dialog'
import { desactivarEventoAction } from '@/features/boletas/actions'

export default function DesactivarEventoButton({ id, titulo }: { id: string; titulo: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [confirming, setConfirming] = useState(false)

  async function handleDesactivar() {
    const ok = await confirmDialog({
      message: `Desactivar "${titulo}"? Dejará de verse en /boletas y no se podrán vender más boletas.`,
      confirmLabel: 'Desactivar',
    })
    if (!ok) return

    setConfirming(true)
    start(async () => {
      try {
        await desactivarEventoAction(id)
        toast.success('Evento desactivado')
        router.refresh()
      } catch (e: any) {
        toast.error(e?.message ?? 'Error al desactivar')
      } finally {
        setConfirming(false)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleDesactivar}
      disabled={pending || confirming}
      className="text-xs font-medium text-neutral-400 hover:text-red-400 disabled:opacity-50"
    >
      Desactivar
    </button>
  )
}

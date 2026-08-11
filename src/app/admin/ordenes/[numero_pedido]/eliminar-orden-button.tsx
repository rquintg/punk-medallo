'use client'

import { useTransition } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteOrden } from '@/features/admin/actions/ordenes'
import { confirmDialog } from '@/components/admin/confirm-dialog'

export default function EliminarOrdenButton({ numeroPedido }: { numeroPedido: string }) {
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const confirmed = await confirmDialog({
        message: `¿Eliminar la orden ${numeroPedido}? Esta acción no se puede deshacer y no puede recuperarse.`,
      })
      if (!confirmed) return
      try {
        await deleteOrden(numeroPedido)
        toast.success('Orden eliminada')
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Error al eliminar')
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors disabled:opacity-50"
    >
      {pending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
      Eliminar orden
    </button>
  )
}
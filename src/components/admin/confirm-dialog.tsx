'use client'

import { toast } from 'sonner'

interface ConfirmOptions {
  message: string
  confirmLabel?: string
  cancelLabel?: string
}

export function confirmDialog({
  message,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
}: ConfirmOptions): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    toast.custom(
      (t) => (
        <div className="bg-[var(--admin-card)] border border-[var(--admin-card-border)] rounded-xl p-4 shadow-xl max-w-sm">
          <p className="text-sm text-[var(--admin-text)] mb-4">{message}</p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                resolve(false)
                toast.dismiss(t)
              }}
              className="btn-secondary text-xs"
            >
              {cancelLabel}
            </button>
            <button
              onClick={() => {
                resolve(true)
                toast.dismiss(t)
              }}
              className="btn-primary text-xs"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      ),
      { duration: Infinity },
    )
  })
}
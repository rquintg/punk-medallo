'use client'

import { useState, useTransition } from 'react'
import { MailCheck } from 'lucide-react'
import { toast } from 'sonner'

export default function ReenviarBoletaButton({ codigo }: { codigo: string }) {
  const [pending, start] = useTransition()
  const [enviado, setEnviado] = useState(false)

  function handleReenviar() {
    start(async () => {
      try {
        const res = await fetch('/api/cuenta/boletas/reenviar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ codigo }),
        })
        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error ?? 'Error al reenviar')
          return
        }
        toast.success(`Boleta reenviada a tu correo`)
        setEnviado(true)
      } catch {
        toast.error('Error de conexión')
      }
    })
  }

  if (enviado) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-700/60 bg-emerald-950/30 px-3 py-1.5 text-xs font-semibold text-emerald-400">
        <MailCheck size={13} />
        Reenviada
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={handleReenviar}
      disabled={pending}
      className="rounded-md border border-neutral-700 px-3 py-1.5 text-xs font-semibold text-neutral-300 transition-colors hover:bg-neutral-800 disabled:opacity-50"
    >
      {pending ? 'Reenviando...' : 'Reenviar por correo'}
    </button>
  )
}

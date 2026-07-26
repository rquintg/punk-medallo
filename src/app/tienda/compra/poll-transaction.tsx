'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface PollTransactionProps {
  transactionId: string
}

export default function PollTransaction({ transactionId }: PollTransactionProps) {
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    const poll = async () => {
      try {
        const res = await fetch(`/api/transactions/${transactionId}`)
        const data = await res.json()
        if (!cancelled && data.status && data.status !== 'PENDING') {
          router.refresh()
        }
      } catch {
        // Reintentar en el próximo ciclo
      }
    }

    const interval = setInterval(poll, 5000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [transactionId, router])

  return (
    <div className="mt-4 flex items-center gap-2 text-sm text-neutral-500">
      <Loader2 size={14} className="animate-spin" />
      Verificando pago...
    </div>
  )
}

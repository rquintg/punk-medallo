'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface RedirectTimerProps {
  targetUrl: string
  seconds?: number
}

export default function RedirectTimer({ targetUrl, seconds = 5 }: RedirectTimerProps) {
  const router = useRouter()
  const [countdown, setCountdown] = useState(seconds)

  useEffect(() => {
    if (countdown <= 0) {
      router.push(targetUrl)
      return
    }
    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown, router, targetUrl])

  return (
    <p className="text-xs text-neutral-500" aria-live="polite">
      Redirigiendo a tu pedido en {countdown} segundos...
    </p>
  )
}

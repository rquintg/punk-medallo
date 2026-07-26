'use client'

import { useEffect } from 'react'
import { useCart } from '@/features/tienda/store/use-cart'

interface ClearCartProps {
  transactionId: string
  transactionStatus: string
}

export default function ClearCart({ transactionId, transactionStatus }: ClearCartProps) {
  useEffect(() => {
    if (transactionStatus !== 'APPROVED') return

    const cleared = sessionStorage.getItem(`cc_${transactionId}`)
    if (cleared) return

    useCart.getState().clearCart()
    sessionStorage.setItem(`cc_${transactionId}`, '1')
  }, [transactionStatus, transactionId])

  return null
}

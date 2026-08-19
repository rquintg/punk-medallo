'use client'

import { useEffect } from 'react'
import { comprar } from '@/lib/analytics'

interface PurchaseEventProps {
  transactionId: string
  value: number
}

export default function PurchaseEvent({ transactionId, value }: PurchaseEventProps) {
  useEffect(() => {
    comprar(transactionId, value, [])
  }, [transactionId, value])

  return null
}
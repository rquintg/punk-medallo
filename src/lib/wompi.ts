import { createHash } from 'crypto'

export function getWompiApiUrl(): string {
  const key = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY ?? ''
  return key.startsWith('pub_test_')
    ? 'https://sandbox.wompi.co/v1'
    : 'https://production.wompi.co/v1'
}

export function getWompiCheckoutUrl(): string {
  const key = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY ?? ''
  return key.startsWith('pub_test_')
    ? 'https://checkout.wompi.co/p'
    : 'https://checkout.wompi.co/p'
}

function sha256Hex(data: string): string {
  return createHash('sha256').update(data, 'utf-8').digest('hex')
}

export function generateIntegritySignature(
  reference: string,
  amountInCents: number,
  currency: string,
  integrityKey: string,
): string {
  const payload = `${reference}${amountInCents}${currency}${integrityKey}`
  return sha256Hex(payload)
}

export interface WompiTransaction {
  id: string
  amount_in_cents: number
  reference: string
  customer_email: string
  currency: string
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR'
  payment_method_type: string
  payment_method?: {
    type: string
    extra?: {
      brand?: string
      last_four?: string
      institution?: string
    }
  }
  status_message?: string
  created_at: string
  paid_at?: string
}

export interface WompiEvent {
  event: string
  data: {
    transaction: WompiTransaction
  }
  environment: 'prod' | 'test'
  signature: {
    properties: string[]
    checksum: string
  }
  timestamp: number
  sent_at: string
}

export function verifyEventSignature(
  event: WompiEvent,
  eventsKey: string,
): boolean {
  const propertyValues = event.signature.properties.map((prop) => {
    const keys = prop.split('.')
    let value: unknown = event.data
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = (value as Record<string, unknown>)[key]
      } else {
        value = ''
        break
      }
    }
    return String(value ?? '')
  })

  const payload = propertyValues.join('') + event.timestamp + eventsKey
  const calculated = sha256Hex(payload).toUpperCase()
  return calculated === event.signature.checksum.toUpperCase()
}

export async function getTransaction(
  transactionId: string,
): Promise<WompiTransaction | null> {
  const privateKey = process.env.WOMPI_PRIVATE_KEY
  if (!privateKey) {
    console.error('WOMPI_PRIVATE_KEY no configurada')
    return null
  }

  const url = `${getWompiApiUrl()}/transactions/${transactionId}`

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${privateKey}`,
    },
  })

  if (!res.ok) {
    console.error('Wompi getTransaction error:', res.status, await res.text())
    return null
  }

  const json = await res.json()
  return json.data as WompiTransaction
}

// Lista transacciones de una referencia (para reconciliar pedidos pendientes
// cuyo webhook nunca llegó). Wompi permite filtrar por ?reference=.
export async function getTransactionsByReference(
  reference: string,
): Promise<WompiTransaction[]> {
  const privateKey = process.env.WOMPI_PRIVATE_KEY
  if (!privateKey) {
    console.error('WOMPI_PRIVATE_KEY no configurada')
    return []
  }

  const url = `${getWompiApiUrl()}/transactions?reference=${encodeURIComponent(reference)}`

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${privateKey}`,
    },
  })

  if (!res.ok) {
    console.error('Wompi getTransactionsByReference error:', res.status, await res.text())
    return []
  }

  const json = await res.json()
  return (json.data as WompiTransaction[]) ?? []
}

export async function getMerchantInfo(publicKey: string) {
  const url = `${getWompiApiUrl()}/merchants/${publicKey}`

  const res = await fetch(url)

  if (!res.ok) {
    console.error('Wompi getMerchantInfo error:', res.status, await res.text())
    return null
  }

  const json = await res.json()
  return json.data as {
    name: string
    accepted_currencies: string[]
    presigned_acceptance: {
      acceptance_token: string
      permalink: string
      type: string
    }
  }
}

export function mapWompiStatus(status: WompiTransaction['status']): string {
  const map: Record<WompiTransaction['status'], string> = {
    PENDING: 'pendiente',
    APPROVED: 'aprobado',
    DECLINED: 'rechazado',
    VOIDED: 'anulado',
    ERROR: 'error',
  }
  return map[status] ?? 'pendiente'
}

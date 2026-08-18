import { createHmac, timingSafeEqual } from 'crypto'

export const ORDER_VERIFY_COOKIE = 'pm_orden_verify'

function secret(): string {
  return (
    process.env.ORDER_VERIFY_SECRET ??
    process.env.CRON_SECRET ??
    'pm-orden-verify-dev-fallback'
  )
}

export function firmarPedido(numeroPedido: string): string {
  return createHmac('sha256', secret()).update(numeroPedido).digest('base64url')
}

export function verificarFirma(
  numeroPedido: string,
  firma: string | null | undefined,
): boolean {
  if (!firma) return false
  const esperado = firmarPedido(numeroPedido)
  const a = Buffer.from(firma)
  const b = Buffer.from(esperado)
  return a.length === b.length && timingSafeEqual(a, b)
}
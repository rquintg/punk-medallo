import { createHmac, randomInt, timingSafeEqual } from 'crypto'

/**
 * Criptografía de boletas — patrón idéntico a order-verify.ts.
 * El QR contiene `PM-TKT-{codigo}|{firma}`; el scanner valida contra DB
 * (el QR es lookup, no credencial).
 */

function secret(): string {
  return (
    process.env.TICKET_SECRET ??
    process.env.ORDER_VERIFY_SECRET ??
    'pm-ticket-dev-fallback'
  )
}

/** Alfabeto sin caracteres ambiguos (sin I,O,0,1) */
const CODIGO_ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generarCodigoBoleta(): string {
  let sufijo = ''
  for (let i = 0; i < 6; i++) {
    sufijo += CODIGO_ALFABETO[randomInt(CODIGO_ALFABETO.length)]
  }
  return `PM-TKT-${sufijo}`
}

export function firmarBoleta(codigo: string): string {
  return createHmac('sha256', secret()).update(codigo).digest('base64url')
}

/** Contenido plano que se codifica en el QR */
export function construirQrPayload(codigo: string): string {
  return `${codigo}|${firmarBoleta(codigo)}`
}

export function parseQrPayload(payload: string): { codigo: string; firma: string } | null {
  const parts = payload.trim().split('|')
  if (parts.length !== 2 || !parts[0].startsWith('PM-TKT-')) return null
  return { codigo: parts[0], firma: parts[1] }
}

export function verificarFirmaBoleta(codigo: string, firma: string): boolean {
  const esperada = Buffer.from(firmarBoleta(codigo))
  const recibida = Buffer.from(firma)
  return esperada.length === recibida.length && timingSafeEqual(esperada, recibida)
}

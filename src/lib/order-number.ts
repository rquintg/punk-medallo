import { randomInt } from 'node:crypto'

/**
 * Genera un numero de pedido unico PM-XXXXXXXX.
 * Extraido de api/checkout para compartirlo con la boleteria.
 */
export function generateOrderNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'PM-'
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(randomInt(chars.length))
  }
  return result
}

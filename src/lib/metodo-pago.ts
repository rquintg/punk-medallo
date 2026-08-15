const GENERICO_WOMPI = '/pagos/Wompi.png'

type InfoMetodo = {
  logo: string | null
  nombre: string
  linea: string
}

const METODOS: Record<string, InfoMetodo> = {
  VISA: { logo: '/pagos/Visa.png', nombre: 'Visa', linea: 'Pago con tarjeta Visa' },
  MASTERCARD: { logo: '/pagos/Symbol.png', nombre: 'Mastercard', linea: 'Pago con tarjeta Mastercard' },
  AMEX: { logo: GENERICO_WOMPI, nombre: 'American Express', linea: 'Pago con tarjeta American Express' },
  DINERS: { logo: GENERICO_WOMPI, nombre: 'Diners Club', linea: 'Pago con tarjeta Diners Club' },
  NEQUI: { logo: '/pagos/Nequi.png', nombre: 'Nequi', linea: 'Pago con Nequi' },
  PSE: { logo: '/pagos/Pse.png', nombre: 'PSE', linea: 'Pago por PSE' },
  DAVIPLATA: { logo: '/pagos/Daviplata.png', nombre: 'Daviplata', linea: 'Pago con Daviplata' },
  BANCOLOMBIA_TRANSFER: { logo: '/pagos/Bancolombia.png', nombre: 'Botón Bancolombia', linea: 'Transferencia por Botón Bancolombia' },
  BANCOLOMBIA_QR: { logo: '/pagos/Qr.svg', nombre: 'QR Bancolombia', linea: 'Pago con QR Bancolombia' },
  PCOL: { logo: GENERICO_WOMPI, nombre: 'Puntos Colombia', linea: 'Pago con Puntos Colombia' },
  BNPL: { logo: GENERICO_WOMPI, nombre: 'BNPL Bancolombia', linea: 'Pago en cuotas (BNPL)' },
  SU_PAY: { logo: GENERICO_WOMPI, nombre: 'Su+ Pay', linea: 'Pago con Su+ Pay' },
  CONTRA_ENTREGA: { logo: null, nombre: 'Contra entrega', linea: 'Efectivo al recibir' },
}

export function canonicalMetodoPago(pmType: string | null | undefined, brand?: string): string {
  if (pmType === 'CARD' && brand) return brand.toUpperCase()
  return pmType ?? 'Wompi'
}

export function metodoPagoInfo(mp: string | null): InfoMetodo {
  const m = mp?.toUpperCase() ?? ''
  const metodo = METODOS[m]
  if (metodo) return metodo
  if (m.startsWith('BANCOLOMBIA_')) return METODOS.BANCOLOMBIA_TRANSFER
  return { logo: GENERICO_WOMPI, nombre: 'Wompi', linea: 'Pago online (Wompi)' }
}

export function metodoPagoLabel(mp: string | null): string {
  return metodoPagoInfo(mp).nombre
}
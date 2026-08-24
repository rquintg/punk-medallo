/**
 * Carga del widget de Wompi en el cliente (singleton por pagina).
 * Compartido entre el checkout de merch y el de boleteria.
 */

export interface WompiWidgetConfig {
  currency: string
  amountInCents: number
  reference: string
  publicKey: string
  signature: { integrity: string }
  redirectUrl?: string
  customerData?: {
    email?: string
    fullName?: string
    phoneNumber?: string
    phoneNumberPrefix?: string
  }
  shippingAddress?: {
    addressLine1?: string
    city?: string
    phoneNumber?: string
    region?: string
    country?: string
  }
}

interface WompiWidgetResult {
  transaction: { id: string; status: string }
}

declare global {
  interface Window {
    WidgetCheckout: new (
      config: WompiWidgetConfig,
    ) => { open: (cb: (result: WompiWidgetResult) => void) => void }
  }
}
export function loadWompiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src*="checkout.wompi.co/widget.js"]')) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.wompi.co/widget.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('No se pudo cargar Wompi'))
    document.head.appendChild(script)
  })
}

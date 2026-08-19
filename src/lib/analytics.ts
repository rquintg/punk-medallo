declare global {
  interface Window {
    dataLayer?: unknown[]
  }
}

function push(nombre: string, params: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  const dl = window.dataLayer
  if (!dl) return
  dl.push({ event: nombre, ...params })
}

export interface ItemAnalitica {
  item_id: string
  item_name: string
  price?: number
  quantity?: number
  item_category?: string
}

export function eventoGa(nombre: string, params: Record<string, unknown> = {}) {
  push(nombre, params)
}

export function verProducto(item: ItemAnalitica) {
  push('view_item', {
    currency: 'COP',
    value: (item.price ?? 0) * (item.quantity ?? 1),
    items: [item],
  })
}

export function agregarAlCarrito(item: ItemAnalitica) {
  push('add_to_cart', {
    currency: 'COP',
    value: (item.price ?? 0) * (item.quantity ?? 1),
    items: [item],
  })
}

export function sacarDelCarrito(item: ItemAnalitica) {
  push('remove_from_cart', {
    currency: 'COP',
    value: (item.price ?? 0) * (item.quantity ?? 1),
    items: [item],
  })
}

export function iniciarCheckout(items: ItemAnalitica[], value: number) {
  push('begin_checkout', {
    currency: 'COP',
    value,
    items,
  })
}

export function comprar(transactionId: string, value: number, items: ItemAnalitica[]) {
  push('purchase', {
    transaction_id: transactionId,
    currency: 'COP',
    value,
    items,
  })
}
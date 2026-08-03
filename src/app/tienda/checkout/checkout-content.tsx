'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2, Minus, Plus, ShoppingBag, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/features/tienda/store/use-cart'
import { Breadcrumbs } from '@/components/tienda/breadcrumbs'
import CiudadDepartamentoSelect from '@/components/tienda/ciudad-departamento-select'
import Price from '@/components/tienda/price'

declare global {
  interface Window {
    WidgetCheckout: new (config: WidgetCheckoutConfig) => { open: (cb: (result: WidgetCheckoutResult) => void) => void }
  }
}

interface WidgetCheckoutConfig {
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

interface WidgetCheckoutResult {
  transaction: {
    id: string
    status: string
  }
}



function loadWompiScript(): Promise<void> {
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

export default function CheckoutContent() {
  const router = useRouter()
  const { items, updateQuantity, removeItem, totalPrecio, totalItems, clearCart } = useCart()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    departamento: '',
    ciudad: '',
    barrio: '',
    notas: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (items.length === 0) {
      toast.error('El carrito está vacío')
      return
    }

    if (!form.nombre || !form.email || !form.telefono || !form.direccion || !form.departamento || !form.ciudad) {
      toast.error('Completa todos los campos del formulario')
      return
    }

    const phoneDigits = form.telefono.replace(/\D/g, '')
    if (phoneDigits.length < 10) {
      toast.error('El teléfono debe tener al menos 10 dígitos (ej: 3001234567)')
      return
    }

    setLoading(true)

    try {
      const body = {
        nombre: form.nombre,
        email: form.email,
        telefono: form.telefono,
        direccion: form.direccion,
        departamento: form.departamento,
        ciudad: form.ciudad,
        barrio: form.barrio,
        notas: form.notas,
      }
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipping: body,
          items,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Error al crear el pedido')
        setLoading(false)
        return
      }

      await loadWompiScript()

      const checkout = new window.WidgetCheckout({
        currency: data.wompi.currency,
        amountInCents: data.wompi.amountInCents,
        reference: data.wompi.reference,
        publicKey: data.wompi.publicKey,
        signature: data.wompi.signature,
        ...(data.wompi.redirectUrl ? { redirectUrl: data.wompi.redirectUrl } : {}),
        customerData: {
          email: form.email,
          fullName: form.nombre,
          phoneNumber: phoneDigits,
          phoneNumberPrefix: '+57',
        },
        shippingAddress: {
          addressLine1: form.direccion,
          city: form.ciudad,
          phoneNumber: phoneDigits,
          region: form.departamento,
          country: 'CO',
        },
      })

      const closeGuard = setTimeout(() => setLoading(false), 30000)

      checkout.open((result) => {
        clearTimeout(closeGuard)
        setLoading(false)
        const transactionId = result.transaction.id
        clearCart()
        router.push(`/tienda/compra?id=${transactionId}`)
      })
    } catch {
      toast.error('Error de conexión. Intentá de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Breadcrumbs
          segments={[
            { label: 'Tienda', href: '/tienda' },
            { label: 'Checkout' },
          ]}
        />
      </div>

      <h1 className="mb-8 text-3xl font-bold text-white md:text-4xl">Checkout</h1>

      <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
        <div className="w-full lg:w-3/5">
          <h2 className="mb-6 text-lg font-semibold text-white">Información de envío</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="nombre" className="mb-1.5 block text-sm text-neutral-300">
                  Nombre completo *
                </label>
                <input
                  id="nombre"
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition-colors focus:border-red-600"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm text-neutral-300">
                  Correo electrónico *
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition-colors focus:border-red-600"
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="telefono" className="mb-1.5 block text-sm text-neutral-300">
                Teléfono *
              </label>
              <input
                id="telefono"
                type="tel"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition-colors focus:border-red-600"
                placeholder="300 123 4567"
              />
            </div>

            <CiudadDepartamentoSelect
              departamento={form.departamento}
              ciudad={form.ciudad}
              onDepartamentoChange={(value) => setForm((prev) => ({ ...prev, departamento: value, ciudad: '' }))}
              onCiudadChange={(value) => setForm((prev) => ({ ...prev, ciudad: value }))}
            />

            <div>
              <label htmlFor="barrio" className="mb-1.5 block text-sm text-neutral-300">
                Barrio
              </label>
              <input
                id="barrio"
                type="text"
                value={form.barrio}
                onChange={(e) => setForm({ ...form, barrio: e.target.value })}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition-colors focus:border-red-600"
                placeholder="Opcional"
              />
            </div>

            <div>
              <label htmlFor="direccion" className="mb-1.5 block text-sm text-neutral-300">
                Dirección *
              </label>
              <input
                id="direccion"
                type="text"
                value={form.direccion}
                onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition-colors focus:border-red-600"
                placeholder="Cra 1 # 2-3"
              />
            </div>

            <div>
              <label htmlFor="notas" className="mb-1.5 block text-sm text-neutral-300">
                Notas adicionales
              </label>
              <textarea
                id="notas"
                rows={3}
                value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition-colors focus:border-red-600"
                placeholder="Instrucciones de entrega, referencia, etc. (opcional)"
              />
            </div>

            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Procesando...' : 'Ir a pagar'}
            </button>
          </form>
        </div>

        <div className="w-full lg:w-2/5">
          <h2 className="mb-6 text-lg font-semibold text-white">
            Resumen del pedido ({totalItems()})
          </h2>

          <div className="rounded-lg border border-neutral-800 bg-neutral-900/50">
            {items.length === 0 ? (
              <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
                <ShoppingBag size={32} className="text-neutral-600" />
                <p className="text-sm text-neutral-500">El carrito está vacío</p>
                <Link
                  href="/tienda"
                  className="text-sm text-red-500 underline underline-offset-2 hover:text-red-400"
                >
                  Ir a la tienda
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-neutral-800">
                {items.map((item) => (
                  <li
                    key={`${item.id}-${item.tallaSeleccionada ?? 'notalla'}-${item.colorSeleccionado ?? 'nocolor'}`}
                    className="flex gap-3 px-6 py-4"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-neutral-800">
                      <Image
                        src={item.imagenes[0]?.url ?? ''}
                        alt={item.nombre}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5">
                      <Link
                        href={`/tienda/${item.slug}`}
                        className="text-sm font-semibold text-white hover:underline"
                      >
                        {item.nombre}
                      </Link>
                      <div className="flex flex-wrap gap-x-3 text-xs text-neutral-500">
                        {item.tallaSeleccionada && (
                          <span>
                            Talla:{' '}
                            <span className="font-medium text-neutral-400">
                              {item.tallaSeleccionada}
                            </span>
                          </span>
                        )}
                        {item.colorSeleccionado && (
                          <span>
                            Color:{' '}
                            <span className="font-medium text-neutral-400">
                              {item.colorSeleccionado}
                            </span>
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-end justify-between">
                        <div className="flex items-center rounded-md border border-neutral-700 bg-neutral-900">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.tallaSeleccionada,
                                item.colorSeleccionado,
                                item.cantidad - 1,
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
                            aria-label="Reducir cantidad"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="flex h-8 w-9 items-center justify-center text-sm font-semibold text-white">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.tallaSeleccionada,
                                item.colorSeleccionado,
                                item.cantidad + 1,
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-base font-bold text-[#dc2626]">
                            <Price amount={item.precio * item.cantidad} />
                          </span>
                          <button
                            onClick={() =>
                              removeItem(item.id, item.tallaSeleccionada, item.colorSeleccionado)
                            }
                            className="text-neutral-500 transition-colors hover:text-[#dc2626]"
                            aria-label="Eliminar producto"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {items.length > 0 && (
              <div className="border-t border-neutral-800 px-6 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">Subtotal</span>
                  <span className="text-sm font-medium text-white">
                    <Price amount={totalPrecio()} />
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-neutral-400">Envío</span>
                  <span className="text-sm text-neutral-500">Por calcular</span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-neutral-800 pt-4">
                  <span className="text-base font-semibold text-white">Total</span>
                  <span className="text-base font-bold text-white">
                    <Price amount={totalPrecio()} />
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

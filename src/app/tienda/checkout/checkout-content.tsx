'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2, Minus, Plus, ShoppingBag, Loader2, CreditCard, Banknote } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/features/tienda/store/use-cart'
import { Breadcrumbs } from '@/components/tienda/breadcrumbs'
import CiudadDepartamentoSelect from '@/components/tienda/ciudad-departamento-select'
import Price from '@/components/tienda/price'
import {
  calcularEnvioConConfig,
  ENVIO_GRATIS_UMBRAL,
  CONTRa_ENTREGA_RECARGO,
  esContraEntregaDisponible,
  calcularRecargoConConfig,
} from '@/data/envio'
import { useTiendaConfig } from '@/hooks/useTiendaConfig'
import PaymentBadges from '@/components/tienda/payment-badges'
import CuponCheckout from '@/components/tienda/cupon-checkout'
import { iniciarCheckout } from '@/lib/analytics'
import { loadWompiScript } from '@/lib/wompi-client'

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
  const [aceptaCambios, setAceptaCambios] = useState(false)
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false)
  const [metodo, setMetodo] = useState<'wompi' | 'contra_entrega'>('wompi')
  const [cupon, setCupon] = useState<{ codigo: string; descuento: number } | null>(null)

  useEffect(() => {
    if (items.length === 0) return
    iniciarCheckout(
      items.map((item) => ({
        item_id: item.slug,
        item_name: item.nombre,
        price: item.precio,
        quantity: item.cantidad,
        item_category: item.categoria?.nombre,
      })),
      totalPrecio(),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tiendaCfg = useTiendaConfig()
  const codDisponible = tiendaCfg.codMunicipios.length
    ? calcularRecargoConConfig(form.departamento, form.ciudad, tiendaCfg) > 0
    : esContraEntregaDisponible(form.departamento, form.ciudad)

  const envioCalculado = form.departamento
    ? calcularEnvioConConfig(totalPrecio(), form.departamento, tiendaCfg)
    : 0
  const umbralGratis = tiendaCfg.envioGratisUmbral ?? ENVIO_GRATIS_UMBRAL
  const recargoCOD = tiendaCfg.codRecargo ?? CONTRa_ENTREGA_RECARGO

  const STORAGE_KEY = 'pm_checkout_v1'
  const [step, setStep] = useState<1 | 2>(1)
  const [hydrated, setHydrated] = useState(false)

  // Hydrate desde localStorage (cliente solo) — evita mismatch SSR
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const d = JSON.parse(raw)
        if (d?.form) setForm((prev) => ({ ...prev, ...d.form }))
        if (typeof d?.aceptaCambios === 'boolean') setAceptaCambios(d.aceptaCambios)
        if (typeof d?.aceptaPrivacidad === 'boolean') setAceptaPrivacidad(d.aceptaPrivacidad)
        if (d?.metodo === 'wompi' || d?.metodo === 'contra_entrega') setMetodo(d.metodo)
        if (d?.cupon && typeof d.cupon.codigo === 'string') setCupon(d.cupon)
        if (d?.step === 1 || d?.step === 2) setStep(d.step)
      }
    } catch {}
    setHydrated(true)
  }, [])

  // Persiste en localStorage on change (debounced implicito por React batch)
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ form, aceptaCambios, aceptaPrivacidad, metodo, cupon, step }),
      )
    } catch {}
  }, [form, aceptaCambios, aceptaPrivacidad, metodo, cupon, step, hydrated])

  const validateStep1 = useCallback(() => {
    if (!form.nombre.trim() || !form.email.trim() || !form.telefono.trim() || !form.direccion.trim() || !form.departamento || !form.ciudad) {
      toast.error('Completa todos los campos del formulario')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error('Ingresa un correo valido')
      return false
    }
    if (form.telefono.replace(/\D/g, '').length < 10) {
      toast.error('El telefono debe tener al menos 10 digitos (ej: 3001234567)')
      return false
    }
    if (!aceptaCambios || !aceptaPrivacidad) {
      toast.error('Debes aceptar las politicas de cambios y privacidad')
      return false
    }
    return true
  }, [form, aceptaCambios, aceptaPrivacidad])

  function handleProceedToPago() {
    if (!validateStep1()) return
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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

    if (!aceptaCambios || !aceptaPrivacidad) {
      toast.error('Debes aceptar las políticas de cambios y privacidad')
      return
    }

    if (metodo === 'contra_entrega' && !codDisponible) {
      toast.error('Pago contra entrega solo disponible en Medellín y área metropolitana')
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
        aceptaPoliticas: true,
      }
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipping: body,
          items,
          metodoPago: metodo,
          ...(cupon ? { cuponCodigo: cupon.codigo } : {}),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Error al crear el pedido')
        setLoading(false)
        return
      }

      // Contra entrega: sin Wompi — ir directo al detalle del pedido
      if (data.metodo === 'contra_entrega') {
        try { localStorage.removeItem(STORAGE_KEY) } catch {}
        clearCart()
        router.push(`/tienda/orden/${data.numero_pedido}`)
        return
      }

      await loadWompiScript()

      const redirectUrl = data.wompi.redirectUrl || `${window.location.origin}/tienda/compra`

      const checkout = new window.WidgetCheckout({
        currency: data.wompi.currency,
        amountInCents: data.wompi.amountInCents,
        reference: data.wompi.reference,
        publicKey: data.wompi.publicKey,
        signature: data.wompi.signature,
        redirectUrl,
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
        try { localStorage.removeItem(STORAGE_KEY) } catch {}
        clearCart()
        router.push(`/tienda/compra?id=${transactionId}`)
      })
    } catch {
      toast.error('Error de conexión. Intenta de nuevo.')
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

      <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">Checkout</h1>
      <div className="mb-6 flex items-center gap-2 text-xs font-medium" aria-label="Progreso de checkout">
        <span className={`flex h-6 w-6 items-center justify-center rounded-full ${step >= 1 ? 'bg-red-600 text-white' : 'bg-neutral-800 text-neutral-500'}`}>1</span>
        <span className={step >= 1 ? 'text-white' : 'text-neutral-500'}>Datos</span>
        <span className={`h-px w-8 ${step >= 2 ? 'bg-red-600' : 'bg-neutral-700'}`} />
        <span className={`flex h-6 w-6 items-center justify-center rounded-full ${step >= 2 ? 'bg-red-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}>2</span>
        <span className={step >= 2 ? 'text-white' : 'text-neutral-500'}>Pago</span>
        <span className="h-px w-8 bg-neutral-700" />
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800 text-neutral-500">3</span>
        <span className="text-neutral-500">Confirmar</span>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
        <div className="w-full lg:w-3/5">
          {step === 1 ? (
            <div>
              <h2 className="mb-6 text-lg font-semibold text-white">Información de envío</h2>
              <div className="flex flex-col gap-4">
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
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition-colors focus:border-red-600 focus:ring-1 focus:ring-red-600/20"
                      placeholder="Tu nombre"
                      autoComplete="name"
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
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition-colors focus:border-red-600 focus:ring-1 focus:ring-red-600/20"
                      placeholder="correo@ejemplo.com"
                      autoComplete="email"
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
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition-colors focus:border-red-600 focus:ring-1 focus:ring-red-600/20"
                    placeholder="300 123 4567"
                    autoComplete="tel"
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
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition-colors focus:border-red-600 focus:ring-1 focus:ring-red-600/20"
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
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition-colors focus:border-red-600 focus:ring-1 focus:ring-red-600/20"
                    placeholder="Cra 1 # 2-3"
                    autoComplete="street-address"
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
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition-colors focus:border-red-600 focus:ring-1 focus:ring-red-600/20"
                    placeholder="Instrucciones de entrega, referencia, etc. (opcional)"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label className="flex cursor-pointer items-start gap-3 text-sm text-neutral-300">
                    <input
                      type="checkbox"
                      checked={aceptaCambios}
                      onChange={(e) => setAceptaCambios(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-red-600"
                    />
                    <span>
                      Acepto la{" "}
                      <Link href="/politica-de-cambios" target="_blank" rel="noopener noreferrer" className="text-red-500 underline underline-offset-2 hover:text-red-400">
                        política de cambios
                      </Link>{" "}
                      (cambio exclusivo por talla, sin devolución, plazo de 7 días, con envíos a cargo del comprador). *
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3 text-sm text-neutral-300">
                    <input
                      type="checkbox"
                      checked={aceptaPrivacidad}
                      onChange={(e) => setAceptaPrivacidad(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-red-600"
                    />
                    <span>
                      Acepto la{" "}
                      <Link href="/politica-de-privacidad" target="_blank" rel="noopener noreferrer" className="text-red-500 underline underline-offset-2 hover:text-red-400">
                        política de privacidad
                      </Link>{" "}
                      y el tratamiento de mis datos personales. *
                    </span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToPago}
                  disabled={items.length === 0}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Proceder con el pago
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Datos de envío</h3>
                  <button type="button" onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="text-xs font-medium text-red-400 underline underline-offset-2 hover:text-red-300">
                    Editar
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
                  <div>
                    <span className="text-neutral-500">nombre:</span> <span className="font-medium text-neutral-200">{form.nombre}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">correo:</span> <span className="font-medium text-neutral-200">{form.email}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-neutral-500">direccion:</span> <span className="font-medium text-neutral-200">{form.direccion}{form.barrio ? `, ${form.barrio}` : ''} — {form.ciudad}, {form.departamento}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">telefono:</span> <span className="font-medium text-neutral-200">{form.telefono}</span>
                  </div>
                  {form.notas && (
                    <div className="sm:col-span-2">
                      <span className="text-neutral-500">notas:</span> <span className="text-neutral-200">{form.notas}</span>
                    </div>
                  )}
                </div>
              </div>

              <h3 className="text-sm font-semibold text-white">Método de pago</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${metodo === 'wompi' ? 'border-red-600 bg-red-600/10' : 'border-neutral-700 bg-neutral-900 hover:border-neutral-600'}`}>
                  <input type="radio" name="metodoPago" checked={metodo === 'wompi'} onChange={() => setMetodo('wompi')} className="mt-0.5 h-4 w-4 shrink-0 accent-red-600" />
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-white"><CreditCard size={16} className="text-neutral-400" /> Pago online</p>
                    <p className="mt-1 text-xs text-neutral-500">Procesado de forma segura por Wompi.</p>
                  </div>
                </label>
                <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${metodo === 'contra_entrega' ? 'border-red-600 bg-red-600/10' : 'border-neutral-700 bg-neutral-900 hover:border-neutral-600'} ${!codDisponible ? 'cursor-not-allowed opacity-50' : ''}`}>
                  <input type="radio" name="metodoPago" checked={metodo === 'contra_entrega'} onChange={() => setMetodo('contra_entrega')} disabled={!codDisponible} className="mt-0.5 h-4 w-4 shrink-0 accent-red-600" />
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-white"><Banknote size={16} className="text-emerald-500" /> Contra entrega</p>
                    <p className="mt-1 text-xs text-neutral-500">Pagas en efectivo al recibir (+<Price amount={recargoCOD} />). Solo Medellín y área metropolitana.</p>
                  </div>
                </label>
              </div>
              <PaymentBadges highlight={metodo} />
              <div className="mt-2 flex gap-3">
                <button type="button" onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="flex-1 rounded-lg border border-neutral-700 bg-transparent px-6 py-3 text-sm font-semibold text-neutral-300 transition-colors hover:bg-neutral-800">
                  Volver
                </button>
                <button type="submit" disabled={loading || items.length === 0} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? 'Procesando...' : metodo === 'contra_entrega' ? 'Confirmar pedido' : 'Ir a pagar'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="w-full lg:w-2/5 lg:sticky lg:top-24 lg:self-start">
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
                  {form.departamento ? (
                    envioCalculado === 0 ? (
                      <span className="text-sm font-medium text-emerald-400">
                        Gratis
                      </span>
                    ) : (
                      <span className="text-sm font-medium text-white">
                        <Price amount={envioCalculado} />
                      </span>
                    )
                  ) : (
                    <span className="text-sm text-neutral-500">Por calcular</span>
                  )}
                </div>
                {totalPrecio() < umbralGratis && (
                  <p className="mt-2 text-xs text-neutral-500">
                    Envio gratis en pedidos mayores a{' '}
                    <Price amount={umbralGratis} />
                  </p>
                )}
                <CuponCheckout
                  email={form.email}
                  subtotal={totalPrecio()}
                  envio={envioCalculado}
                  onCambio={setCupon}
                />
                {metodo === 'contra_entrega' && codDisponible && (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-neutral-400">Contra entrega</span>
                    <span className="text-sm font-medium text-white">
                      <Price amount={recargoCOD} />
                    </span>
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between border-t border-neutral-800 pt-4">
                  <span className="text-base font-semibold text-white">Total</span>
                  <span className="text-base font-bold text-white">
                    <Price
                      amount={
                        totalPrecio() +
                        envioCalculado +
                        (metodo === 'contra_entrega' && codDisponible ? recargoCOD : 0) -
                        (cupon?.descuento ?? 0)
                      }
                    />
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

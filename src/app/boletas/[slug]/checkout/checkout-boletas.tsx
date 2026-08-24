'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, ShieldCheck, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import Price from '@/components/tienda/price'
import CuponCheckout from '@/components/tienda/cupon-checkout'
import PaymentBadges from '@/components/tienda/payment-badges'
import { loadWompiScript } from '@/lib/wompi-client'
import { createClient } from '@/lib/supabase/client'

interface ItemSeleccion {
  tipoId: string
  nombre: string
  precio: number
  cantidad: number
}

const STORAGE_KEY = 'pm_boletas_checkout'

export default function CheckoutBoletas({ slug }: { slug: string }) {
  const router = useRouter()
  const [items, setItems] = useState<ItemSeleccion[] | null>(null)
  const [clienteNombre, setClienteNombre] = useState('')
  const [clienteEmail, setClienteEmail] = useState('')
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false)
  const [cupon, setCupon] = useState<{ codigo: string; descuento: number } | null>(null)
  const [loading, setLoading] = useState(false)

  // Hidratar selección desde sessionStorage + datos del usuario
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw)
        if (data?.slug === slug && Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items)
        } else {
          setItems([])
        }
      } else {
        setItems([])
      }
    } catch {
      setItems([])
    }

    ;(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setClienteNombre((user.user_metadata?.name as string) ?? '')
        setClienteEmail(user.email ?? '')
      }
    })()
  }, [slug])

  const subtotal = (items ?? []).reduce((s, i) => s + i.precio * i.cantidad, 0)
  const totalBoletas = (items ?? []).reduce((s, i) => s + i.cantidad, 0)
  const total = Math.max(0, subtotal - (cupon?.descuento ?? 0))

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!items || items.length === 0 || totalBoletas === 0) return

    if (!aceptaPrivacidad) {
      toast.error('Debes aceptar la política de privacidad')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/boletas/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(({ tipoId, cantidad }) => ({ tipoId, cantidad })),
          ...(cupon ? { cuponCodigo: cupon.codigo } : {}),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Error al crear el pedido')
        setLoading(false)
        return
      }

      await loadWompiScript()
      if (typeof window.WidgetCheckout === 'undefined') {
        throw new Error('El widget de Wompi no cargó (¿bloqueador de anuncios o red?)')
      }

      const redirectUrl =
        data.wompi.redirectUrl || `${window.location.origin}/tienda/compra`

      const checkout = new window.WidgetCheckout({
        currency: data.wompi.currency,
        amountInCents: data.wompi.amountInCents,
        reference: data.wompi.reference,
        publicKey: data.wompi.publicKey,
        signature: data.wompi.signature,
        redirectUrl,
        customerData: {
          fullName: clienteNombre,
          email: clienteEmail,
        },
      })

      const closeGuard = setTimeout(() => setLoading(false), 30000)

      checkout.open((result) => {
        clearTimeout(closeGuard)
        setLoading(false)
        try {
          sessionStorage.removeItem(STORAGE_KEY)
        } catch {}
        const txId = result?.transaction?.id || data.numero_pedido
        router.push(`/tienda/compra?id=${txId}`)
      })
    } catch (e) {
      console.error('[Boletas] Error iniciando el pago:', e)
      toast.error(e instanceof Error && e.message.includes('Wompi')
        ? e.message
        : 'Error al iniciar el pago. Intenta de nuevo.')
      setLoading(false)
    }
  }

  if (items === null) return null

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-surface p-8 text-center">
        <AlertTriangle size={32} className="mx-auto mb-3 text-amber-400" />
        <p className="font-semibold text-white">No hay boletas seleccionadas</p>
        <Link
          href={`/boletas/${slug}`}
          className="mt-3 inline-block text-sm font-medium text-red-500 underline underline-offset-4 hover:text-red-400"
        >
          Volver a elegir boletas
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Resumen */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50">
        <ul className="divide-y divide-neutral-800">
          {items.map((i) => (
            <li key={i.tipoId} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-semibold text-white">{i.nombre}</p>
                <p className="text-xs text-neutral-500">
                  {i.cantidad} × <Price amount={i.precio} />
                </p>
              </div>
              <span className="text-base font-bold text-[#dc2626]">
                <Price amount={i.precio * i.cantidad} />
              </span>
            </li>
          ))}
        </ul>

        <div className="border-t border-neutral-800 px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-400">Subtotal</span>
            <span className="text-sm font-medium text-white"><Price amount={subtotal} /></span>
          </div>
          <CuponCheckout
            email={clienteEmail}
            subtotal={subtotal}
            envio={0}
            onCambio={setCupon}
          />
          <div className="mt-3 flex items-center justify-between border-t border-neutral-800 pt-3">
            <span className="text-base font-bold text-white">Total</span>
            <span className="text-xl font-black text-white"><Price amount={total} /></span>
          </div>
        </div>
      </div>

      {/* Avisos + privacidad */}
      <div className="rounded-lg border border-amber-700/50 bg-amber-950/20 p-4">
        <p className="flex items-start gap-2 text-xs leading-relaxed text-amber-300">
          <ShieldCheck size={15} className="mt-0.5 shrink-0" />
          Cada boleta es personal, con QR único a tu nombre. No reembolsable salvo
          cancelación del evento. Preséntala en la puerta junto con tu documento.
        </p>
      </div>

      <label className="flex cursor-pointer items-start gap-3 text-sm text-neutral-300">
        <input
          type="checkbox"
          checked={aceptaPrivacidad}
          onChange={(e) => setAceptaPrivacidad(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-red-600"
        />
        <span>
          Acepto la{' '}
          <Link href="/politica-de-privacidad" target="_blank" rel="noopener noreferrer"
            className="text-red-500 underline underline-offset-2 hover:text-red-400">
            política de privacidad
          </Link>{' '}
          y el tratamiento de mis datos. *
        </span>
      </label>

      {/* Pago */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-white">Método de pago</h3>
        <PaymentBadges />
      </div>

      <button
        type="submit"
        disabled={loading || !aceptaPrivacidad}
        className="w-full rounded-lg bg-[#dc2626] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-all hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading && <Loader2 size={16} className="inline animate-spin" />}
        {loading ? ' Procesando...' : 'Ir a pagar'}
      </button>

      <Link
        href={`/boletas/${slug}`}
        className="block text-center text-sm text-neutral-500 hover:text-neutral-300"
      >
        Volver
      </Link>
    </form>
  )
}

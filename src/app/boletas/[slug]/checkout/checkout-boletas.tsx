'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, ShieldCheck, AlertTriangle, Ticket, User, Mail, Phone } from 'lucide-react'
import { toast } from 'sonner'
import Price from '@/components/tienda/price'
import CuponCheckout from '@/components/tienda/cupon-checkout'
import PaymentBadges from '@/components/tienda/payment-badges'
import { Breadcrumbs } from '@/components/tienda/breadcrumbs'
import { loadWompiScript } from '@/lib/wompi-client'
import { createClient } from '@/lib/supabase/client'
import { useBoletasCheckout } from '@/features/boletas/store/use-boletas-checkout'

export default function CheckoutBoletas({ slug, eventoTitulo, eventoLugar }: { slug: string; eventoTitulo?: string; eventoLugar?: string }) {
  const router = useRouter()
  const {
    items,
    slug: storedSlug,
    clienteNombre,
    telefono,
    aceptaPrivacidad,
    aceptaTerminosBoleteria,
    cupon,
    step,
    setField,
    setCupon,
    setStep,
    clear,
    subtotal: getSubtotal,
    total: getTotal,
    validateStep1,
  } = useBoletasCheckout()

  const [clienteEmail, setClienteEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Hydration gate + compat con sessionStorage legacy + prefill email/nombre
  useEffect(() => {
    // compat: si el store esta vacio pero sessionStorage tiene seleccion, migrar
    try {
      if ((!items || items.length === 0) && storedSlug !== slug) {
        const raw = sessionStorage.getItem('pm_boletas_checkout')
        if (raw) {
          const data = JSON.parse(raw)
          if (data?.slug === slug && Array.isArray(data.items) && data.items.length > 0) {
            useBoletasCheckout.getState().setItems(data.items, slug)
          }
        }
      }
    } catch {}
    // prefill desde auth (email siempre fresco, nombre solo si vacio)
    ;(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setClienteEmail(user.email ?? '')
        const metaName = (user.user_metadata?.name as string) ?? ''
        if (metaName && !useBoletasCheckout.getState().clienteNombre) {
          setField({ clienteNombre: metaName })
        }
      }
    })()
    setHydrated(true)
  }, [slug, items, storedSlug, setField])

  const subtotal = getSubtotal()
  const total = getTotal()
  const totalBoletas = items.reduce((s, i) => s + i.cantidad, 0)
  const isCurrentSlug = storedSlug === slug

  function handleProceedToPago() {
    const err = validateStep1()
    if (err) {
      toast.error(err)
      return
    }
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!isCurrentSlug || items.length === 0 || totalBoletas === 0) return

    const err = validateStep1()
    if (err) {
      toast.error(err)
      return
    }

    const phoneDigits = telefono.replace(/\D/g, '')
    setLoading(true)
    try {
      const res = await fetch('/api/boletas/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(({ tipoId, cantidad }) => ({ tipoId, cantidad })),
          nombre: clienteNombre.trim(),
          telefono: phoneDigits,
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
        throw new Error('El widget de Wompi no cargo (¿bloqueador de anuncios o red?)')
      }

      const redirectUrl = data.wompi.redirectUrl || `${window.location.origin}/tienda/compra`

      const checkout = new window.WidgetCheckout({
        currency: data.wompi.currency,
        amountInCents: data.wompi.amountInCents,
        reference: data.wompi.reference,
        publicKey: data.wompi.publicKey,
        signature: data.wompi.signature,
        redirectUrl,
        customerData: {
          fullName: clienteNombre.trim(),
          email: clienteEmail,
          phoneNumber: phoneDigits,
        },
      })

      const closeGuard = setTimeout(() => setLoading(false), 30000)

      checkout.open((result) => {
        clearTimeout(closeGuard)
        setLoading(false)
        clear()
        try {
          sessionStorage.removeItem('pm_boletas_checkout')
        } catch {}
        const txId = result?.transaction?.id || data.numero_pedido
        router.push(`/tienda/compra?id=${txId}`)
      })
    } catch (e) {
      console.error('[Boletas] Error iniciando el pago:', e)
      toast.error(e instanceof Error && e.message.includes('Wompi') ? e.message : 'Error al iniciar el pago. Intenta de nuevo.')
      setLoading(false)
    }
  }

  if (!hydrated) return null

  if (!isCurrentSlug || items.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-surface p-8 text-center">
        <AlertTriangle size={32} className="mx-auto mb-3 text-amber-400" />
        <p className="font-semibold text-white">No hay boletas seleccionadas</p>
        <Link href={`/boletas/${slug}`} className="mt-3 inline-block text-sm font-medium text-red-500 underline underline-offset-4 hover:text-red-400">
          Volver a elegir boletas
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Breadcrumbs
          segments={
            eventoTitulo
              ? [
                  { label: 'Boletas', href: '/boletas' },
                  { label: eventoTitulo, href: `/boletas/${slug}` },
                  { label: 'Checkout' },
                ]
              : [
                  { label: 'Boletas', href: '/boletas' },
                  { label: 'Checkout' },
                ]
          }
        />
      </div>

      <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">Checkout</h1>
      {eventoTitulo && (
        <p className="mb-6 text-sm text-neutral-400">
          {eventoTitulo}
          {eventoLugar ? ` · ${eventoLugar}` : ''}
        </p>
      )}

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
              <h2 className="mb-6 text-lg font-semibold text-white">Tus datos</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label htmlFor="boleta-nombre" className="mb-1.5 block text-sm text-neutral-300">
                    Nombre completo *
                  </label>
                  <input
                    id="boleta-nombre"
                    type="text"
                    value={clienteNombre}
                    onChange={(e) => setField({ clienteNombre: e.target.value })}
                    placeholder="Tu nombre como aparece en tu documento"
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition-colors focus:border-red-600 focus:ring-1 focus:ring-red-600/20"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm text-neutral-300">
                    <Mail size={14} /> Correo electrónico
                  </label>
                  <input type="email" value={clienteEmail} readOnly className="w-full rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-2.5 text-sm text-neutral-400 outline-none" />
                  <p className="mt-1 text-xs text-neutral-500">Usaremos el correo de tu cuenta para enviarte las boletas.</p>
                </div>
                <div>
                  <label htmlFor="boleta-tel" className="mb-1.5 flex items-center gap-1.5 text-sm text-neutral-300">
                    <Phone size={14} /> Teléfono *
                  </label>
                  <input id="boleta-tel" type="tel" value={telefono} onChange={(e) => setField({ telefono: e.target.value })} placeholder="300 123 4567" className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition-colors focus:border-red-600 focus:ring-1 focus:ring-red-600/20" autoComplete="tel" />
                </div>

                <div className="rounded-lg border border-amber-700/50 bg-amber-950/20 p-4">
                  <p className="flex items-start gap-2 text-xs leading-relaxed text-amber-300">
                    <ShieldCheck size={15} className="mt-0.5 shrink-0" />
                    Cada boleta es personal, con QR unico a tu nombre. No reembolsable salvo cancelacion del evento. Presentala en la puerta junto con tu documento.
                  </p>
                </div>

                <label className="flex cursor-pointer items-start gap-3 text-sm text-neutral-300">
                  <input type="checkbox" checked={aceptaPrivacidad} onChange={(e) => setField({ aceptaPrivacidad: e.target.checked })} className="mt-0.5 h-4 w-4 shrink-0 accent-red-600" />
                  <span>
                    Acepto la{' '}
                    <Link href="/politica-de-privacidad" target="_blank" rel="noopener noreferrer" className="text-red-500 underline underline-offset-2 hover:text-red-400">
                      politica de privacidad
                    </Link>{' '}
                    y el tratamiento de mis datos. *
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-3 text-sm text-neutral-300">
                  <input type="checkbox" checked={aceptaTerminosBoleteria} onChange={(e) => setField({ aceptaTerminosBoleteria: e.target.checked })} className="mt-0.5 h-4 w-4 shrink-0 accent-red-600" />
                  <span>
                    Acepto los{' '}
                    <Link href="/terminos-boleteria" target="_blank" rel="noopener noreferrer" className="text-red-500 underline underline-offset-2 hover:text-red-400">
                      terminos de boleteria
                    </Link>{' '}
                    (boleta nominativa, QR unico, limite 4 por persona, no reembolsable). *
                  </span>
                </label>

                <button type="button" onClick={handleProceedToPago} className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700">
                  Proceder con el pago
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Tus datos</h3>
                  <button type="button" onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="text-xs font-medium text-red-400 underline underline-offset-2 hover:text-red-300">
                    Editar
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <span className="text-neutral-500">nombre:</span> <span className="font-medium text-neutral-200">{clienteNombre}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">correo:</span> <span className="font-medium text-neutral-200">{clienteEmail}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">telefono:</span> <span className="font-medium text-neutral-200">{telefono}</span>
                  </div>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-white">Metodo de pago</h3>
              <div className="rounded-lg border border-red-600 bg-red-600/10 p-4">
                <p className="text-sm font-semibold text-white">Pago online</p>
                <p className="mt-1 text-xs text-neutral-400">Procesado de forma segura por Wompi.</p>
              </div>
              <PaymentBadges highlight="wompi" hideEfectivo />
              <p className="text-xs text-neutral-500">No guardamos datos de tu tarjeta. Pago 100% seguro.</p>

              <div className="mt-2 flex gap-3">
                <button type="button" onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="flex-1 rounded-lg border border-neutral-700 bg-transparent px-6 py-3 text-sm font-semibold text-neutral-300 transition-colors hover:bg-neutral-800">
                  Volver
                </button>
                <button type="submit" disabled={loading} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? 'Procesando...' : 'Ir a pagar'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="w-full lg:w-2/5 lg:sticky lg:top-24 lg:self-start">
          <h2 className="mb-6 text-lg font-semibold text-white">Resumen ({totalBoletas} boleta{totalBoletas !== 1 ? 's' : ''})</h2>

          <div className="relative overflow-hidden rounded-xl border border-neutral-800 bg-gradient-to-br from-[#1a0a0a] to-[#111] p-5">
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `repeating-linear-gradient(45deg, #dc2626 0 1px, transparent 1px 8px)` }} aria-hidden />
            <p className="relative flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#dc2626]">
              <Ticket size={14} /> Vista previa de tu entrada
            </p>
            <div className="relative mt-3 rounded-lg border border-dashed border-neutral-700 bg-black/40 p-4">
              <p className="truncate text-sm font-bold text-white">{clienteNombre || 'Tu nombre'}</p>
              <p className="truncate text-xs text-neutral-400">{clienteEmail || 'tu@correo.com'}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {items.map((i) => (
                  <span key={i.tipoId} className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-black">
                    {i.cantidad}× {i.nombre}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-right text-lg font-black text-white"><Price amount={total} /></p>
            </div>
            <p className="relative mt-2 text-center text-[11px] text-neutral-500">Asi se vera tu boleta · QR unico por entrada</p>
          </div>

          <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-900/50">
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
              <CuponCheckout email={clienteEmail} subtotal={subtotal} envio={0} onCambio={(c) => setCupon(c)} />
              <div className="mt-3 flex items-center justify-between border-t border-neutral-800 pt-3">
                <span className="text-base font-bold text-white">Total</span>
                <span className="text-xl font-black text-white"><Price amount={total} /></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

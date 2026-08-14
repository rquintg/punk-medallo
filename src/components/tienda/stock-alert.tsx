'use client'

import { useEffect, useState } from 'react'
import { BellRing, Check } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface StockAlertProps {
  productoId: string
  talla?: string | null
  color?: string | null
}

export function StockAlert({ productoId, talla, color }: StockAlertProps) {
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [pending, setPending] = useState(false)
  const [ok, setOk] = useState(false)

  // Mejora: si hay sesión, precargar el email del usuario logueado
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setEmail(data.user.email)
      }
    })
  }, [])

  // Si cambia la combinación (o el producto), el aviso anterior ya no aplica:
  // resetear el estado de éxito para permitir registrar la nueva combinación.
  useEffect(() => {
    setOk(false)
  }, [productoId, talla, color])

  const comboLabel = [color, talla].filter(Boolean).join(' / ')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      toast.error('Ingresá un correo válido')
      return
    }

    setPending(true)
    try {
      const res = await fetch('/api/avisos-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          producto_id: productoId,
          email: email.trim(),
          telefono: telefono.trim() || null,
          talla: talla ?? null,
          color: color ?? null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Error al guardar el aviso')
      }
      setOk(true)
      toast.success(`Te avisamos cuando vuelva el stock${comboLabel ? ` de ${comboLabel}` : ''}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar el aviso')
    } finally {
      setPending(false)
    }
  }

  if (ok) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-emerald-900/60 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-400">
        <Check size={16} className="shrink-0" />
        Listo — te escribimos apenas vuelva el stock{comboLabel ? ` de ${comboLabel}` : ''}.
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-md border border-neutral-800 bg-[#181818] p-4"
    >
      <p className="flex items-center gap-2 text-sm font-semibold text-white">
        <BellRing size={16} className="text-[#dc2626]" />
        Avisame cuando haya stock{comboLabel ? ` en ${comboLabel}` : ''}
      </p>
      <p className="mt-1 text-xs text-neutral-500">
        Dejanos tu correo (y opcional tu WhatsApp) y te notificamos en cuanto esté disponible.
      </p>
      <div className="mt-3 space-y-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          className="w-full rounded-md border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-[#dc2626]"
        />
        <div className="flex gap-2">
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="WhatsApp opcional (ej. 3014453392)"
            className="flex-1 rounded-md border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-[#dc2626]"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'Guardando…' : 'Avisarme'}
          </button>
        </div>
      </div>
    </form>
  )
}

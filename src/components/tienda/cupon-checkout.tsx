'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Ticket, X, Loader2 } from 'lucide-react'
import Price from '@/components/tienda/price'
import { normalizarCodigo } from '@/features/cupones/calculo'

type TipoCuponAplicado = 'porcentaje' | 'fijo' | 'envio'

type EstadoCupon =
  | { etapa: 'idle' }
  | { etapa: 'cargando'; codigo: string }
  | { etapa: 'error'; mensaje: string }
  | {
      etapa: 'aplicado'
      descuento: number
      codigo: string
      tipo: TipoCuponAplicado
    }

interface CuponCheckoutProps {
  email: string
  subtotal: number
  envio: number
  onCambio: (cupon: { codigo: string; descuento: number } | null) => void
}

export default function CuponCheckout({ email, subtotal, envio, onCambio }: CuponCheckoutProps) {
  const [input, setInput] = useState('')
  const [estado, setEstado] = useState<EstadoCupon>({ etapa: 'idle' })

  // Guard de respuestas obsoletas: si el usuario quita/re-aplica el cupón
  // mientras una validación está en vuelo, la respuesta vieja se descarta.
  const tokenRef = useRef(0)

  // Última combinación (código|subtotal|envío) ya validada: el efecto de
  // revalidación la usa para no disparar requests redundantes tras aplicar.
  const ultimoValidadoRef = useRef<string | null>(null)

  const validar = useCallback(
    async (codigo: string, subtotalActual: number) => {
      if (!codigo) return
      if (!email) {
        setEstado({ etapa: 'error', mensaje: 'Completa tu correo primero' })
        return
      }

      ultimoValidadoRef.current = `${codigo}|${subtotalActual}|${envio}`
      const token = tokenRef.current
      setEstado({ etapa: 'cargando', codigo })
      try {
        const res = await fetch('/api/cupones/validar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ codigo, email, subtotal: subtotalActual }),
        })
        const data = await res.json()

        if (tokenRef.current !== token) return

        if (!res.ok) {
          setEstado({ etapa: 'error', mensaje: data.error ?? 'Error validando el cupón' })
          return
        }

        if (!data.valido) {
          setEstado({ etapa: 'error', mensaje: data.mensaje ?? 'El cupón no se puede aplicar' })
          onCambio(null)
          return
        }

        const descuento =
          data.cupon.tipo === 'envio'
            ? envio
            : data.cupon.tipo === 'porcentaje'
              ? Math.round((subtotalActual * data.cupon.valor) / 100)
              : Math.min(data.cupon.valor, subtotalActual)

        setEstado({
          etapa: 'aplicado',
          descuento,
          codigo: data.cupon.codigo,
          tipo: data.cupon.tipo,
        })
        onCambio({ codigo: data.cupon.codigo, descuento })
      } catch {
        if (tokenRef.current !== token) return
        setEstado({ etapa: 'error', mensaje: 'Error de conexión. Intentá de nuevo.' })
      }
    },
    [email, envio, onCambio],
  )

  // Ref siempre actual para que el efecto no dependa de la identidad de `validar`
  // (cambia con cada tecla del email → revalidaciones innecesarias).
  const validarRef = useRef(validar)
  useEffect(() => {
    validarRef.current = validar
  })

  // El código aplicado permanece estable entre 'cargando' y 'aplicado':
  // las transiciones de estado NO re-disparan el efecto de revalidación.
  const codigoAplicado =
    estado.etapa === 'aplicado' || estado.etapa === 'cargando' ? estado.codigo : null

  // Re-validar solo cuando cambian valores primitivos relevantes:
  // cupón aplicado, subtotal del carrito o tarifa de envío (departamento).
  // `ultimoValidadoRef` evita el disparo redundante justo después de aplicar.
  useEffect(() => {
    if (!codigoAplicado) return
    const clave = `${codigoAplicado}|${subtotal}|${envio}`
    if (ultimoValidadoRef.current === clave) return
    ultimoValidadoRef.current = clave
    const timer = setTimeout(() => {
      void validarRef.current(codigoAplicado, subtotal)
    }, 400)
    return () => clearTimeout(timer)
  }, [codigoAplicado, subtotal, envio])

  function quitar() {
    tokenRef.current++
    setEstado({ etapa: 'idle' })
    setInput('')
    onCambio(null)
  }

  return (
    <div className="mt-2">
      {estado.etapa !== 'aplicado' ? (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Ticket
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              placeholder="Cupón de descuento"
              disabled={estado.etapa === 'cargando'}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 py-2.5 pl-9 pr-3 text-sm text-white placeholder-neutral-500 outline-none transition-colors focus:border-red-600 disabled:opacity-50"
            />
          </div>
          <button
            type="button"
            onClick={() => void validar(normalizarCodigo(input), subtotal)}
            disabled={estado.etapa === 'cargando' || !input.trim()}
            className="shrink-0 rounded-lg border border-neutral-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-red-600 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {estado.etapa === 'cargando' ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              'Aplicar'
            )}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg border border-emerald-700/50 bg-emerald-900/20 px-3 py-2.5">
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-400">
            <Ticket size={15} />
            {estado.codigo}
            <span className="hidden font-normal text-emerald-500 sm:inline">
              {estado.tipo === 'envio'
                ? 'Envío gratis'
                : 'Descuento aplicado'}
            </span>
          </p>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-emerald-400">
              −<Price amount={estado.descuento} />
            </span>
            <button
              type="button"
              onClick={quitar}
              className="text-emerald-500 transition-colors hover:text-white"
              aria-label="Quitar cupón"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}
      {estado.etapa === 'error' && (
        <p className="mt-1.5 text-xs text-red-400">{estado.mensaje}</p>
      )}
    </div>
  )
}
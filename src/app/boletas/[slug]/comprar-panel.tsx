'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Minus, Plus, ShieldCheck } from 'lucide-react'
import Price from '@/components/tienda/price'

export interface TipoPanel {
  id: string
  nombre: string
  precio: number
  disponibles: number
}

/**
 * Panel de selección de boletas (steppers por tipo).
 * - Sin sesión: CTA lleva a /login con redirect de vuelta.
 * - Con sesión: máximos reales por usuario (4 − ya compradas) y por disponibilidad.
 * Al continuar guarda la selección en sessionStorage para el checkout (T4).
 */
export default function ComprarPanel({
  slug,
  tipos,
  maximos,
}: {
  slug: string
  tipos: TipoPanel[]
  /** null = sin sesión autenticada */
  maximos: Record<string, number> | null
}) {
  const router = useRouter()
  const [cantidades, setCantidad] = useState<Record<string, number>>({})

  const total = useMemo(
    () =>
      tipos.reduce((s, t) => s + t.precio * (cantidades[t.id] ?? 0), 0),
    [tipos, cantidades],
  )
  const totalBoletas = Object.values(cantidades).reduce((s, n) => s + n, 0)
  const logueado = maximos !== null

  function cambiar(tipoId: string, delta: number, tope: number) {
    setCantidad((prev) => {
      const actual = prev[tipoId] ?? 0
      const nuevo = Math.min(tope, Math.max(0, actual + delta))
      if (nuevo === actual) return prev
      return { ...prev, [tipoId]: nuevo }
    })
  }

  function handleContinuar() {
    const items = tipos
      .filter((t) => (cantidades[t.id] ?? 0) > 0)
      .map((t) => ({
        tipoId: t.id,
        nombre: t.nombre,
        precio: t.precio,
        cantidad: cantidades[t.id],
      }))
    if (items.length === 0) return

    try {
      sessionStorage.setItem(
        'pm_boletas_checkout',
        JSON.stringify({ slug, items }),
      )
    } catch {}
    router.push(`/boletas/${slug}/checkout`)
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-surface p-5 sm:p-6">
      <h2 className="mb-1 text-lg font-bold text-white">Consigue tus boletas</h2>
      {!logueado && (
        <p className="mb-4 flex items-start gap-2 text-xs leading-relaxed text-neutral-500">
          <ShieldCheck size={14} className="mt-0.5 shrink-0" />
          Cada boleta es personal y única — inicia sesión para comprarla a tu nombre.
        </p>
      )}

      <div className="space-y-4">
        {tipos.map((t) => {
          // Sin sesión mostramos hasta 4 como tope visual (el real se valida al entrar/loguear)
          const tope = Math.min(logueado ? (maximos![t.id] ?? 0) : 4, t.disponibles)
          const qty = cantidades[t.id] ?? 0
          const agotado = t.disponibles === 0

          return (
            <div key={t.id} className="rounded-lg border border-neutral-800 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{t.nombre}</p>
                  <p className="text-sm font-bold text-[#dc2626]">
                    <Price amount={t.precio} />
                  </p>
                  {agotado && (
                    <span className="mt-1 inline-block rounded-full bg-neutral-800 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                      Agotado
                    </span>
                  )}
                  {logueado && !agotado && tope <= 3 && tope > 0 && (
                    <span className="mt-1 block text-[11px] font-medium text-amber-400">
                      Máximo {tope} más (límite de 4 por persona)
                    </span>
                  )}
                </div>

                {/* Stepper */}
                <div className="flex shrink-0 items-center rounded-md border border-neutral-700">
                  <button
                    type="button"
                    onClick={() => cambiar(t.id, -1, tope)}
                    disabled={qty === 0}
                    aria-label={`Quitar una boleta ${t.nombre}`}
                    className="flex h-9 w-9 items-center justify-center text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white disabled:opacity-40"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="flex h-9 w-10 items-center justify-center text-sm font-bold text-white">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => cambiar(t.id, 1, tope)}
                    disabled={agotado || qty >= tope}
                    aria-label={`Agregar una boleta ${t.nombre}`}
                    className="flex h-9 w-9 items-center justify-center text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white disabled:opacity-40"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Resumen + CTA */}
      <div className="mt-5 border-t border-neutral-800 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-neutral-400">
            Total{totalBoletas > 0 && ` (${totalBoletas} boleta${totalBoletas !== 1 ? 's' : ''})`}
          </span>
          <span className="text-xl font-black text-white">
            <Price amount={total} />
          </span>
        </div>

        {logueado ? (
          <button
            type="button"
            onClick={handleContinuar}
            disabled={totalBoletas === 0}
            className="w-full rounded-lg bg-[#dc2626] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-all hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
          >
            Continuar al pago
          </button>
        ) : (
          <Link
            href={`/login?redirect=/boletas/${slug}`}
            className="block w-full rounded-lg bg-[#dc2626] px-6 py-3 text-center text-sm font-bold uppercase tracking-wide text-white transition-all hover:bg-red-700 active:scale-[0.98]"
          >
            Inicia sesión para comprar
          </Link>
        )}

        <p className="mt-3 text-center text-[11px] leading-relaxed text-neutral-600">
          Pago seguro procesado por Wompi · Boleta digital con QR único
        </p>
      </div>
    </div>
  )
}

'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Minus, Plus, ShieldCheck } from 'lucide-react'
import Price from '@/components/tienda/price'
import { useBoletasCheckout } from '@/features/boletas/store/use-boletas-checkout'

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
  ya = 0,
  restante = 0,
}: {
  slug: string
  tipos: TipoPanel[]
  /** null = sin sesión autenticada */
  maximos: Record<string, number> | null
  ya?: number
  restante?: number
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
      let nuevo = Math.min(tope, Math.max(0, actual + delta))
      // Enforce global restante across tipos (anti-revendedores)
      if (logueado && delta > 0) {
        const totalOtros = Object.entries(prev).reduce(
          (s, [id, v]) => (id === tipoId ? s : s + (v ?? 0)),
          0,
        )
        const maxGlobal = restante - totalOtros
        nuevo = Math.min(nuevo, Math.max(0, maxGlobal))
      }
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

    useBoletasCheckout.getState().setItems(items, slug)
    router.push(`/boletas/${slug}/checkout`)
  }

  const limiteAlcanzado = logueado && restante === 0

  return (
    <div className="rounded-xl border border-neutral-800 bg-surface p-5 sm:p-6">
      <h2 className="mb-1 text-lg font-bold text-white">Consigue tus boletas</h2>
      {!logueado ? (
        <p className="mb-3 flex items-start gap-2 text-xs leading-relaxed text-neutral-500">
          <ShieldCheck size={14} className="mt-0.5 shrink-0" />
          Cada boleta es personal y única — inicia sesion para comprarla a tu nombre. Limite 4 por persona.
        </p>
      ) : limiteAlcanzado ? (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-700/40 bg-red-950/30 px-3 py-2.5">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-red-400" />
          <div className="text-xs leading-relaxed text-red-200">
            <p className="font-semibold">Ya tienes 4 boletas para este evento. Alcanzaste el limite de 4 por persona.</p>
            <p className="mt-1 text-red-300/80">
              Gestiona tus boletas en{' '}
              <Link href="/cuenta/boletas" className="font-semibold underline underline-offset-2 hover:text-red-100">
                Mis boletas
              </Link>
              .
            </p>
          </div>
        </div>
      ) : ya > 0 ? (
        <p
          className={`mb-3 rounded-md border px-3 py-2 text-xs ${
            restante <= 2
              ? 'border-amber-700/40 bg-amber-950/30 text-amber-200'
              : 'border-emerald-700/40 bg-emerald-950/30 text-emerald-200'
          }`}
        >
          Tienes <span className="font-semibold text-white">{ya} de 4</span> boletas para este evento — te quedan{' '}
          <span className="font-semibold text-white">{restante}</span> mas.
        </p>
      ) : (
        <p className="mb-3 text-xs text-emerald-300/80">Limite 4 boletas por persona. Selección valida con QR único.</p>
      )}

      <div className="space-y-4">
        {tipos.map((t) => {
          // Sin sesión mostramos hasta 4 como tope visual (el real se valida al entrar/loguear)
          const tope = Math.min(logueado ? (maximos![t.id] ?? 0) : 4, t.disponibles)
          const qty = cantidades[t.id] ?? 0
          const agotado = t.disponibles === 0

          const pocasQuedan = !agotado && t.disponibles > 0 && t.disponibles < 20
          return (
            <div
              key={t.id}
              className={`relative overflow-hidden rounded-lg border p-4 transition-colors ${
                agotado
                  ? 'border-neutral-800 bg-neutral-900/30 opacity-60'
                  : qty > 0
                    ? 'border-red-600/50 bg-red-950/10'
                    : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
              }`}
            >
              {qty > 0 && <span className="absolute left-0 top-0 h-full w-1 bg-[#dc2626]" />}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold tracking-wide text-white">{t.nombre}</p>
                  <p className="text-base font-black text-[#dc2626]">
                    <Price amount={t.precio} />
                  </p>
                  {agotado ? (
                    <span className="mt-1 inline-block rounded-full bg-neutral-800 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                      Agotado
                    </span>
                  ) : limiteAlcanzado || (tope === 0 && !agotado) ? (
                    <span className="mt-1 inline-block rounded-full border border-red-700/40 bg-red-950/30 px-2 py-0.5 text-[11px] font-semibold text-red-300">
                      Limite alcanzado (4 por persona)
                    </span>
                  ) : pocasQuedan ? (
                    <span className="mt-1 inline-block animate-pulse rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-400">
                      ¡Últimas {t.disponibles}!
                    </span>
                  ) : null}
                  {logueado && !agotado && !limiteAlcanzado && tope > 0 && (
                    <span
                      className={`mt-1 block text-[11px] font-medium ${
                        restante <= 2 ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {ya > 0
                        ? `Maximo ${tope} mas — tienes ${ya} de 4`
                        : `Maximo ${tope} (limite 4 por persona)`}
                    </span>
                  )}
                  {!logueado && !agotado && (
                    <span className="mt-1 block text-[11px] text-emerald-400/80">Limite 4 por persona</span>
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
                    disabled={agotado || qty >= tope || (logueado && totalBoletas >= restante)}
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

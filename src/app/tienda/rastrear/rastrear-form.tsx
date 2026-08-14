'use client'

import { useActionState } from 'react'
import { PackageSearch } from 'lucide-react'
import { rastrearPedido, type RastrearState } from '@/features/tienda/actions/rastrear'

const initialState: RastrearState = { error: null }

export default function RastrearForm() {
  const [state, formAction, pending] = useActionState(rastrearPedido, initialState)

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="numero"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-neutral-500"
        >
          Número de pedido
        </label>
        <input
          id="numero"
          name="numero"
          type="text"
          required
          autoComplete="off"
          placeholder="PM-XXXXXXXX"
          className="w-full rounded-md border border-neutral-700 bg-[#111] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-[#dc2626]"
        />
        <p className="mt-1 text-[11px] text-neutral-600">
          Lo encontrás en el correo de confirmación y en el recibo de pago.
        </p>
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-neutral-500"
        >
          Correo del pedido
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="tu@correo.com"
          className="w-full rounded-md border border-neutral-700 bg-[#111] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-[#dc2626]"
        />
      </div>

      {state.error && (
        <p className="rounded-md border border-red-900/60 bg-red-950/40 px-3 py-2 text-xs text-red-400">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <PackageSearch size={16} aria-hidden="true" />
        {pending ? 'Buscando…' : 'Rastrear mi pedido'}
      </button>
    </form>
  )
}

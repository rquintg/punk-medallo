'use client'

import { useActionState } from 'react'
import { ShieldCheck } from 'lucide-react'
import {
  verificarPedido,
  type VerificarPedidoState,
} from '@/features/tienda/actions/verificar-pedido'

const initialState: VerificarPedidoState = { error: null }

export default function VerificarOrdenForm({ numero }: { numero: string }) {
  const [state, formAction, pending] = useActionState(verificarPedido, initialState)

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="numero" value={numero} />

      <div>
        <label
          htmlFor="email-verificar"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-neutral-500"
        >
          Correo del pedido
        </label>
        <input
          id="email-verificar"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="tu@correo.com"
          className="w-full rounded-md border border-neutral-700 bg-[#111] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-[#dc2626]"
        />
        <p className="mt-1 text-[11px] text-neutral-600">
          Es el correo que usaste al hacer el pedido. Solo se usa para
          confirmar que sos vos.
        </p>
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
        <ShieldCheck size={16} aria-hidden="true" />
        {pending ? 'Verificando…' : 'Ver mis datos de envío'}
      </button>
    </form>
  )
}
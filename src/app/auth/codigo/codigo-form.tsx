'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { KeyRound } from 'lucide-react'
import { verificarCodigo } from './actions'
import type { CodigoState } from './actions'

export default function CodigoForm() {
  const [state, formAction, pending] = useActionState(
    verificarCodigo,
    { error: null } satisfies CodigoState,
  )

  return (
    <div className="mx-auto max-w-7xl px-4 pt-20 pb-8">
      <div className="mx-auto max-w-md mt-16">
        <div className="border border-[rgba(164,2,2,0.3)] rounded-lg p-8 bg-[rgba(20,20,20,0.8)]">
          <div className="flex items-center gap-3 mb-8">
            <KeyRound className="text-[#ff4444]" size={28} />
            <h1 className="text-2xl font-bold text-white">Confirma tu cuenta</h1>
          </div>

          <p className="text-white/60 text-sm leading-relaxed mb-6">
            Ingresa el correo con el que te registraste y el código de 6 dígitos
            que te llegó para activar tu cuenta.
          </p>

          <form action={formAction} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded bg-[#222] border border-[rgba(164,2,2,0.3)] text-white focus:outline-none focus:border-[#ff4444] focus:ring-1 focus:ring-[#ff4444]/30 placeholder:text-white/30"
                placeholder="tucorreo@ejemplo.com"
              />
            </div>

            <div>
              <label htmlFor="codigo" className="block text-sm font-medium text-white/80 mb-1">
                Código de confirmación
              </label>
              <input
                id="codigo"
                name="codigo"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                required
                maxLength={6}
                placeholder="••••••"
                className="w-full px-4 py-2.5 rounded bg-[#222] border border-[rgba(164,2,2,0.3)] text-white tracking-[0.5em] text-center text-lg font-mono focus:outline-none focus:border-[#ff4444] focus:ring-1 focus:ring-[#ff4444]/30 placeholder:text-white/30"
              />
            </div>

            {state?.error && (
              <p className="text-red-400 text-sm">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full border border-[#a40202] text-[#ff4444] font-bold tracking-[0.5px] uppercase px-6 py-3 rounded text-sm transition-all duration-300 bg-[rgba(164,2,2,0.1)] hover:bg-[rgba(164,2,2,0.25)] hover:border-[#ff4444] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pending ? 'Verificando...' : 'Activar cuenta'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/60">
            ¿No te llega el código?{' '}
            <Link href="/login" className="text-[#ff4444] hover:underline">
              Ingresa con tu correo y contraseña
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
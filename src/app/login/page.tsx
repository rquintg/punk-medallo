'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { LogIn } from 'lucide-react'
import { login } from './actions'
import type { LoginState } from './actions'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, { error: null } satisfies LoginState)

  return (
    <div className="mx-auto max-w-7xl px-4 pt-20 pb-8">
      <div className="mx-auto max-w-md mt-16">
        <div className="border border-[rgba(164,2,2,0.3)] rounded-lg p-8 bg-[rgba(20,20,20,0.8)]">
          <div className="flex items-center gap-3 mb-8">
            <LogIn className="text-[#ff4444]" size={28} />
            <h1 className="text-2xl font-bold text-white">Ingresar</h1>
          </div>

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
                className="w-full px-4 py-2.5 rounded bg-[#222] border border-[rgba(164,2,2,0.3)] text-white focus:outline-none focus:border-[#ff4444] focus:ring-1 focus:ring-[#ff4444]/30 placeholder:text-white/30"
                placeholder="tucorreo@ejemplo.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-2.5 rounded bg-[#222] border border-[rgba(164,2,2,0.3)] text-white focus:outline-none focus:border-[#ff4444] focus:ring-1 focus:ring-[#ff4444]/30 placeholder:text-white/30"
                placeholder="••••••••"
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
              {pending ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/60">
            ¿No tienes cuenta?{' '}
            <Link href="/registro" className="text-[#ff4444] hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

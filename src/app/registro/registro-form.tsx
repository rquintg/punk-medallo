'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { UserPlus, MailCheck } from 'lucide-react'
import { signup } from './actions'
import type { SignupState } from './actions'

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    signup,
    { error: null, success: false, email: '', name: '' } satisfies SignupState,
  )

  if (state.success) {
    return (
      <div className="mx-auto max-w-7xl px-4 pt-20 pb-8">
        <div className="mx-auto max-w-md mt-16">
          <div className="border border-[rgba(164,2,2,0.3)] rounded-lg p-8 bg-[rgba(20,20,20,0.8)] text-center">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-[rgba(164,2,2,0.15)] p-4">
                <MailCheck className="text-[#ff4444]" size={40} />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">
              Revisa tu correo
            </h1>

            <p className="text-white/60 text-sm mb-1">
              <span className="font-bold capitalize">{state.name}</span>, te enviamos un link de confirmación a
            </p>
            <p className="text-[#ff4444] font-semibold text-sm mb-6">
              {state.email}
            </p>

            <p className="text-white/50 text-sm leading-relaxed mb-4">
              Haz clic en el link que te llegó para activar tu cuenta.
              Si no lo ves, revisa la carpeta de spam.
            </p>

            <p className="text-white/50 text-sm leading-relaxed mb-8">
              ¿No funciona el botón? Ingresa el código del correo en{' '}
              <Link href="/auth/codigo" className="text-[#ff4444] hover:underline">
                /auth/codigo
              </Link>
              .
            </p>

            <Link
              href="/tienda"
              className="inline-block border border-[#a40202] text-[#ff4444] font-bold tracking-[0.5px] uppercase px-6 py-3 rounded text-sm transition-all duration-300 bg-[rgba(164,2,2,0.1)] hover:bg-[rgba(164,2,2,0.25)]"
            >
              Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-20 pb-8">
      <div className="mx-auto max-w-md mt-16">
        <div className="border border-[rgba(164,2,2,0.3)] rounded-lg p-8 bg-[rgba(20,20,20,0.8)]">
          <div className="flex items-center gap-3 mb-8">
            <UserPlus className="text-[#ff4444]" size={28} />
            <h1 className="text-2xl font-bold text-white">Crear cuenta</h1>
          </div>

          <form action={formAction} className="space-y-5">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-white/80 mb-1">
                Nombre
              </label>
              <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded bg-[#222] border border-[rgba(164,2,2,0.3)] text-white focus:outline-none focus:border-[#ff4444] focus:ring-1 focus:ring-[#ff4444]/30 placeholder:text-white/30"
                  placeholder="Tu nombre"
              />
            </div>

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
                minLength={6}
                className="w-full px-4 py-2.5 rounded bg-[#222] border border-[rgba(164,2,2,0.3)] text-white focus:outline-none focus:border-[#ff4444] focus:ring-1 focus:ring-[#ff4444]/30 placeholder:text-white/30"
                placeholder="Mínimo 6 caracteres"
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
              {pending ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/60">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-[#ff4444] hover:underline">
              Ingresa
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

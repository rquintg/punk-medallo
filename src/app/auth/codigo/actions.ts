'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DEFAULT_AUTH_REDIRECT } from '@/lib/constants'

export interface CodigoState {
  error: string | null
}

export async function verificarCodigo(prevState: CodigoState, formData: FormData): Promise<CodigoState> {
  const supabase = await createClient()

  const email = ((formData.get('email') as string) ?? '').trim().toLowerCase()
  const token = ((formData.get('codigo') as string) ?? '').replace(/\s/g, '')

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Ingresa el correo con el que te registraste.' }
  }

  if (!/^\d{6}$/.test(token)) {
    return { error: 'Ingresa el código de 6 dígitos que recibiste por correo.' }
  }

  const { error } = await supabase.auth.verifyOtp({ type: 'signup', email, token })

  if (error) {
    return {
      error: 'El código es inválido o venció. Revisa tu correo o registrate de nuevo.',
    }
  }

  redirect(DEFAULT_AUTH_REDIRECT)
}
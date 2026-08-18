'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { safeRedirect } from '@/lib/safe-redirect'
import { DEFAULT_AUTH_REDIRECT } from '@/lib/constants'

export interface LoginState {
  error: string | null
}

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  const redirectTo = safeRedirect(formData.get('redirect') as string, DEFAULT_AUTH_REDIRECT)
  revalidatePath(redirectTo, 'layout')
  redirect(redirectTo)
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { authRedirectUrl } from '@/lib/site-url'

export interface SignupState {
  error: string | null
  success: boolean
  email: string
  name: string
}

export async function signup(prevState: SignupState, formData: FormData): Promise<SignupState> {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signUp({
    email, password,
    options: {
      data: {name},
      emailRedirectTo: authRedirectUrl(),
    }
  })

  if (error) {
    return { error: error.message, success: false, email: '', name: '' }
  }

  return { error: null, success: true, email, name }
}

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DEFAULT_AUTH_REDIRECT } from '@/lib/constants'
import { getUserRole, roleAtLeast } from '@/lib/admin'

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

  const role = await getUserRole()
  if (role && roleAtLeast(role, 'editor')) {
    revalidatePath('/admin', 'layout')
    redirect('/admin')
  }

  revalidatePath(DEFAULT_AUTH_REDIRECT, 'layout')
  redirect(DEFAULT_AUTH_REDIRECT)
}

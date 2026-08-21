'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSupabaseAdmin } from '@/features/admin/services/supabase-admin'
import { firmarPedido, ORDER_VERIFY_COOKIE } from '@/lib/order-verify'

export interface RastrearState {
  error: string | null
}

const NUMERO_RE = /^PM-[A-Z0-9]+$/i

export async function rastrearPedido(
  _prevState: RastrearState,
  formData: FormData,
): Promise<RastrearState> {
  const numero = (formData.get('numero') as string)?.trim() ?? ''
  const email = (formData.get('email') as string)?.trim().toLowerCase() ?? ''

  if (!NUMERO_RE.test(numero) || !/^\S+@\S+\.\S+$/.test(email)) {
    return { error: 'Revisa el número de pedido y el correo.' }
  }

  const { data, error } = await getSupabaseAdmin()
    .from('pedidos')
    .select('numero_pedido')
    .eq('numero_pedido', numero)
    .ilike('email', email)
    .maybeSingle()

  const pedido = data as unknown as { numero_pedido: string } | null

  if (error || !pedido) {
    return {
      error:
        'No encontramos un pedido con esos datos. Verifica que el número y el correo coincidan con los del checkout.',
    }
  }

  const cookieStore = await cookies()
  cookieStore.set(ORDER_VERIFY_COOKIE, firmarPedido(pedido.numero_pedido), {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  redirect(`/tienda/orden/${pedido.numero_pedido}`)
}

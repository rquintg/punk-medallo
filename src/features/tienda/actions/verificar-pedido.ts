'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSupabaseAdmin } from '@/features/admin/services/supabase-admin'
import { firmarPedido, ORDER_VERIFY_COOKIE } from '@/lib/order-verify'

export interface VerificarPedidoState {
  error: string | null
}

const NUMERO_RE = /^PM-[A-Z0-9]+$/i
const MAX_EDAD_COOKIE = 60 * 60 * 24 * 7

export async function verificarPedido(
  _prevState: VerificarPedidoState,
  formData: FormData,
): Promise<VerificarPedidoState> {
  const numero = (formData.get('numero') as string)?.trim() ?? ''
  const email = (formData.get('email') as string)?.trim().toLowerCase() ?? ''

  if (!NUMERO_RE.test(numero) || !/^\S+@\S+\.\S+$/.test(email)) {
    return { error: 'Revisá el número de pedido y el correo.' }
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
        'El número y el correo no coinciden con ningún pedido. Verificá que sean los del checkout.',
    }
  }

  const cookieStore = await cookies()
  cookieStore.set(ORDER_VERIFY_COOKIE, firmarPedido(pedido.numero_pedido), {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: MAX_EDAD_COOKIE,
    path: '/',
  })

  redirect(`/tienda/orden/${pedido.numero_pedido}`)
}
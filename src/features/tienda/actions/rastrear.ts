'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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
    return { error: 'Revisá el número de pedido y el correo.' }
  }

  const supabase = await createClient()

  const { data: pedido, error } = await supabase
    .from('pedidos')
    .select('numero_pedido')
    .eq('numero_pedido', numero)
    .ilike('email', email)
    .maybeSingle()

  if (error || !pedido) {
    return {
      error:
        'No encontramos un pedido con esos datos. Verificá que el número y el correo coincidan con los del checkout.',
    }
  }

  redirect(`/tienda/orden/${pedido.numero_pedido}`)
}

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSupabaseAdmin } from '../services/supabase-admin'
import { sendOrderPreparing, sendOrderShipped, sendOrderDelivered } from '@/lib/email'

const EMAIL_ESTADOS = ['preparando', 'enviado', 'entregado']

export async function actualizarEstadoOrden(numeroPedido: string, estado: string) {
  const supabase = getSupabaseAdmin()

  const estadoNormalized = estado.toLowerCase()

  const { error } = await (supabase.from('pedidos') as any)
    .update({ estado: estadoNormalized })
    .eq('numero_pedido', numeroPedido)

  if (error) throw new Error(error.message)

  if (EMAIL_ESTADOS.includes(estadoNormalized)) {
    const { data: orden } = await (supabase
      .from('pedidos')
      .select('email, nombre_entrega, numero_pedido')
      .eq('numero_pedido', numeroPedido)
      .single() as any)

    if (orden) {
      const emailData = {
        email: orden.email,
        customerName: orden.nombre_entrega,
        orderNumber: orden.numero_pedido,
      }

      if (estadoNormalized === 'preparando') sendOrderPreparing(emailData)
      else if (estadoNormalized === 'enviado') sendOrderShipped(emailData)
      else if (estadoNormalized === 'entregado') sendOrderDelivered(emailData)
    }
  }

  revalidatePath(`/admin/ordenes/${numeroPedido}`)
  revalidatePath('/admin/ordenes')
}

export async function deleteOrden(numeroPedido: string) {
  const supabase = getSupabaseAdmin()

  const { error } = await (supabase.from('pedidos') as any)
    .delete()
    .eq('numero_pedido', numeroPedido)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/ordenes')
  redirect('/admin/ordenes')
}

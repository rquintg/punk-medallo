'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSupabaseAdmin } from '../services/supabase-admin'
import { requirePermissionAction } from '../utils/auth-server'
import { sendOrderPreparing, sendOrderShipped, sendOrderDelivered } from '@/lib/email'

const EMAIL_ESTADOS = ['preparando', 'enviado', 'entregado']

const FECHA_POR_ESTADO: Record<string, string> = {
  preparando: 'fecha_preparando',
  enviado: 'fecha_enviado',
  entregado: 'fecha_entregado',
}

export async function actualizarEstadoOrden(numeroPedido: string, estado: string) {
  await requirePermissionAction('update_order_status')
  const supabase = getSupabaseAdmin()

  const estadoNormalized = estado.toLowerCase()

  const updateData: Record<string, unknown> = { estado: estadoNormalized }
  const columnaFecha = FECHA_POR_ESTADO[estadoNormalized]
  if (columnaFecha) updateData[columnaFecha] = new Date().toISOString()

  const { error } = await (supabase.from('pedidos') as any)
    .update(updateData)
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

      try {
        if (estadoNormalized === 'preparando') await sendOrderPreparing(emailData)
        else if (estadoNormalized === 'enviado') await sendOrderShipped(emailData)
        else if (estadoNormalized === 'entregado') await sendOrderDelivered(emailData)
      } catch (emailError) {
        console.error('Error enviando email de orden:', emailError)
      }
    }
  }

  revalidatePath(`/admin/ordenes/${numeroPedido}`)
  revalidatePath('/admin/ordenes')
}

export async function deleteOrden(numeroPedido: string) {
  await requirePermissionAction('delete_orders')
  const supabase = getSupabaseAdmin()

  const { error } = await (supabase.from('pedidos') as any)
    .delete()
    .eq('numero_pedido', numeroPedido)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/ordenes')
  redirect('/admin/ordenes')
}

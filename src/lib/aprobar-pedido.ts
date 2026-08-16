import { revalidatePath } from 'next/cache'
import type { SupabaseClient } from '@supabase/supabase-js'
import { sendOrderApproved, sendOrderConfirmation, sendOrderDeclined } from '@/lib/email'
import { canonicalMetodoPago } from '@/lib/metodo-pago'
import type { WompiTransaction } from '@/lib/wompi'

// Datos del pedido que la aprobación/rechazo necesitan (mismo select que el webhook).
export interface PedidoParaPago {
  id: string
  numero_pedido: string
  total: number
  email: string
  nombre_entrega: string
  telefono: string | null
  direccion: string | null
  ciudad: string | null
  departamento: string | null
  barrio: string | null
  notas: string | null
  created_at: string
}

export const SELECT_PEDIDO_PARA_PAGO = 'id, numero_pedido, total, email, nombre_entrega, telefono, direccion, ciudad, departamento, barrio, notas, created_at'

type DeductedItem =
  | { producto_id: string; stockBefore: number }
  | { variante_id: string; stockBefore: number }

async function rollbackStock(supabase: SupabaseClient, deductedItems: DeductedItem[]) {
  for (const d of deductedItems) {
    if ('variante_id' in d) {
      await supabase.from('producto_variantes').update({ stock: d.stockBefore }).eq('id', d.variante_id)
    } else {
      await supabase.from('productos').update({ stock: d.stockBefore }).eq('id', d.producto_id)
    }
  }
}

// Descuenta stock y pasa el pedido a aprobado (con metodo de pago, referencia y
// fechas). Lanza error con el stock ya revertido si algo falla. Usado por el
// webhook de Wompi y por el cron de reconciliación.
export async function aprobarPedido(
  supabase: SupabaseClient,
  pedido: PedidoParaPago,
  transactionId: string,
  transaction: WompiTransaction,
): Promise<void> {
  const { data: items, error: itemsError } = await supabase
    .from('pedido_items')
    .select('producto_id, variante_id, cantidad')
    .eq('pedido_id', pedido.id)

  if (itemsError || !items) {
    throw new Error('Error obteniendo items del pedido')
  }

  const deducted: DeductedItem[] = []

  try {
    for (const item of items) {
      if (item.variante_id) {
        const { data: variant, error: variantError } = await supabase
          .from('producto_variantes')
          .select('stock')
          .eq('id', item.variante_id)
          .single()

        if (variantError || !variant) {
          throw new Error(`Variante no encontrada: ${item.variante_id}`)
        }
        if (variant.stock < item.cantidad) {
          throw new Error(`Stock insuficiente en variante: ${item.variante_id}`)
        }

        const stockBefore = variant.stock
        const { error: updateError } = await supabase
          .from('producto_variantes')
          .update({ stock: Math.max(0, stockBefore - item.cantidad) })
          .eq('id', item.variante_id)

        if (updateError) {
          throw new Error(`Error actualizando stock de variante: ${item.variante_id}`)
        }
        deducted.push({ variante_id: item.variante_id, stockBefore })
      } else {
        const { data: product, error: productError } = await supabase
          .from('productos')
          .select('stock')
          .eq('id', item.producto_id)
          .single()

        if (productError || !product) {
          throw new Error(`Producto no encontrado: ${item.producto_id}`)
        }
        if (product.stock < item.cantidad) {
          throw new Error(`Stock insuficiente: ${item.producto_id}`)
        }

        const stockBefore = product.stock
        const { error: updateError } = await supabase
          .from('productos')
          .update({ stock: Math.max(0, stockBefore - item.cantidad) })
          .eq('id', item.producto_id)

        if (updateError) {
          throw new Error(`Error actualizando stock: ${item.producto_id}`)
        }
        deducted.push({ producto_id: item.producto_id, stockBefore })
      }
    }

    const pmType = transaction.payment_method_type
    const brand = transaction.payment_method?.extra?.brand

    const { error: estadoError } = await supabase
      .from('pedidos')
      .update({
        estado: 'aprobado',
        fecha_aprobado: new Date().toISOString(),
        metodo_pago: canonicalMetodoPago(pmType, brand),
        referencia_pago: transactionId,
        pagado_at: transaction.paid_at ?? new Date().toISOString(),
      })
      .eq('id', pedido.id)

    if (estadoError) {
      throw new Error(`Error actualizando estado: ${pedido.id}`)
    }
  } catch (err) {
    await rollbackStock(supabase, deducted)
    throw err
  }

  // Revalidar página del producto y catálogo (el stock cambió)
  const { data: productosAfectados } = await supabase
    .from('productos')
    .select('slug')
    .in('id', items.map((i) => i.producto_id))

  for (const p of productosAfectados ?? []) {
    revalidatePath(`/tienda/${p.slug}`)
  }
  revalidatePath('/tienda')
}

// Emails que acompañan la aprobación (confirmación de compra + aprobado).
export async function enviarEmailsAprobacion(
  supabase: SupabaseClient,
  pedido: PedidoParaPago,
) {
  const { data: pedidoItems } = await supabase
    .from('pedido_items')
    .select('nombre, precio, talla, color, cantidad, imagen_url')
    .eq('pedido_id', pedido.id)

  const estimatedDelivery = new Date(
    new Date(pedido.created_at).getTime() + 5 * 24 * 60 * 60 * 1000,
  ).toLocaleDateString('es-CO', { dateStyle: 'long' })

  await sendOrderConfirmation({
    orderNumber: pedido.numero_pedido,
    customerName: pedido.nombre_entrega,
    email: pedido.email,
    phone: pedido.telefono ?? '',
    address: pedido.direccion ?? '',
    departamento: pedido.departamento ?? '',
    city: pedido.ciudad ?? '',
    barrio: pedido.barrio ?? '',
    notes: pedido.notas ?? '',
    items: (pedidoItems ?? []).map((i) => ({
      name: i.nombre,
      quantity: i.cantidad,
      price: i.precio,
      size: i.talla,
      color: i.color,
      imageUrl: i.imagen_url,
    })),
    total: pedido.total,
    estimatedDelivery,
  })

  await sendOrderApproved({
    orderNumber: pedido.numero_pedido,
    customerName: pedido.nombre_entrega,
    email: pedido.email,
  })
}

// Actualiza a un estado no aprobado y envía el email de declinación si aplica
// (rechazado/anulado/error). Usado por webhook y cron de reconciliación.
export async function procesarEstadoNoAprobado(
  supabase: SupabaseClient,
  pedido: PedidoParaPago,
  wompiStatus: WompiTransaction['status'],
  nuevoEstado: string,
) {
  const { error: updateError } = await supabase
    .from('pedidos')
    .update({ estado: nuevoEstado })
    .eq('id', pedido.id)

  if (updateError) throw new Error(`Error actualizando pedido: ${pedido.id}`)

  if (['rechazado', 'anulado', 'error'].includes(nuevoEstado)) {
    await sendOrderDeclined({
      orderNumber: pedido.numero_pedido,
      customerName: pedido.nombre_entrega,
      email: pedido.email,
      reason:
        wompiStatus === 'DECLINED' ? 'rechazado'
        : wompiStatus === 'VOIDED' ? 'anulado'
        : 'error en el procesamiento',
    })
  }
}
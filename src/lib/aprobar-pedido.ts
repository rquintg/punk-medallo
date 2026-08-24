import { revalidatePath } from 'next/cache'
import type { SupabaseClient } from '@supabase/supabase-js'
import { sendOrderApproved, sendOrderConfirmation, sendOrderDeclined } from '@/lib/email'
import { canonicalMetodoPago } from '@/lib/metodo-pago'
import type { WompiTransaction } from '@/lib/wompi'
import { generarCodigoBoleta, firmarBoleta } from '@/lib/ticket-crypto'
import { sendTicketsEmail } from '@/lib/email'

// Datos del pedido que la aprobación/rechazo necesitan (mismo select que el webhook).
export interface PedidoParaPago {
  id: string
  usuario_id: string | null
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

export const SELECT_PEDIDO_PARA_PAGO = 'id, numero_pedido, usuario_id, total, email, nombre_entrega, telefono, direccion, ciudad, departamento, barrio, notas, created_at'

type DeductedItem =
  | { producto_id: string; stockBefore: number }
  | { variante_id: string; stockBefore: number }

// Resultado del guard de idempotencia atómico:
// - 'aprobado': esta llamada ganó la carrera (stock descontado, pedido aprobado)
// - 'ya_procesado': otro evento/cron ya procesó el pedido → no hacer nada
// - 'rechazado_stock': stock insuficiente → pedido a 'rechazado' + email (no reintentar)
export type ResultadoAprobacion = 'aprobado' | 'ya_procesado' | 'rechazado_stock'

async function rollbackStock(supabase: SupabaseClient, deductedItems: DeductedItem[]) {
  for (const d of deductedItems) {
    if ('variante_id' in d) {
      await supabase.from('producto_variantes').update({ stock: d.stockBefore }).eq('id', d.variante_id)
    } else {
      await supabase.from('productos').update({ stock: d.stockBefore }).eq('id', d.producto_id)
    }
  }
}

// Reclama el pedido de forma atómica: solo gana el UPDATE si sigue 'pendiente'.
// Devuelve true si esta instancia ganó, false si otro proceso ya lo reclamó.
async function reclamarPedido(
  supabase: SupabaseClient,
  pedidoId: string,
  transactionId: string,
  transaction: WompiTransaction,
): Promise<boolean> {
  const pmType = transaction.payment_method_type
  const brand = transaction.payment_method?.extra?.brand

  const { data: claimed, error: claimError } = await supabase
    .from('pedidos')
    .update({
      estado: 'aprobado',
      fecha_aprobado: new Date().toISOString(),
      metodo_pago: canonicalMetodoPago(pmType, brand),
      referencia_pago: transactionId,
      pagado_at: transaction.paid_at ?? new Date().toISOString(),
    })
    .eq('id', pedidoId)
    .eq('estado', 'pendiente')
    .select('id')
    .maybeSingle()

  if (claimError) {
    throw new Error(`Error reclamando pedido: ${pedidoId}`)
  }
  return claimed !== null
}

// Deja el pedido de nuevo en 'pendiente' tras un fallo post-reclamo, para que
// el webhook (retry) o el cron de reconciliación lo reintenten.
async function restablecerPendiente(supabase: SupabaseClient, pedidoId: string) {
  await supabase.from('pedidos').update({ estado: 'pendiente' }).eq('id', pedidoId)
}

// Descuenta stock de forma atómica (update condicional con `.gte` sobre stock).
// Lanza si falla la query o si la carrera se pierde (stock cambió entre read y
// update); el llamador revierte y reintenta.
async function descontarStockItem(
  supabase: SupabaseClient,
  tipo: 'producto' | 'variante',
  id: string,
  cantidad: number,
): Promise<number> {
  const tabla = tipo === 'variante' ? 'producto_variantes' : 'productos'

  const { data: fila, error: readError } = await supabase
    .from(tabla)
    .select('stock')
    .eq('id', id)
    .single()

  if (readError || !fila) {
    throw new Error(`${tipo === 'variante' ? 'Variante' : 'Producto'} no encontrada: ${id}`)
  }

  const { error: updateError, data: actualizado } = await supabase
    .from(tabla)
    .update({ stock: Math.max(0, fila.stock - cantidad) })
    .eq('id', id)
    .gte('stock', cantidad)
    .select('id')

  if (updateError) {
    throw new Error(`Error actualizando stock de ${tipo}: ${id}`)
  }
  if (!actualizado || actualizado.length === 0) {
    throw new Error(`Carrera de stock en ${tipo}: ${id}`)
  }

  return fila.stock
}

// Aprueba el pedido con guard de idempotencia atómico y descuento de stock
// atómico. Usado por el webhook de Wompi y el cron de reconciliación.
export async function aprobarPedido(
  supabase: SupabaseClient,
  pedido: PedidoParaPago,
  transactionId: string,
  transaction: WompiTransaction,
): Promise<ResultadoAprobacion> {
  if (!(await reclamarPedido(supabase, pedido.id, transactionId, transaction))) {
    return 'ya_procesado'
  }

  const { data: items, error: itemsError } = await supabase
    .from('pedido_items')
    .select('producto_id, variante_id, cantidad, nombre, tipo_boleta_id, evento_id')
    .eq('pedido_id', pedido.id)

  if (itemsError || !items) {
    await restablecerPendiente(supabase, pedido.id)
    throw new Error('Error obteniendo items del pedido')
  }

  const deducted: DeductedItem[] = []
  const boletasPorGenerar: Array<{ tipoId: string; eventoId: string; nombreTipo: string; cantidad: number }> = []

  try {
    for (const item of items) {
      // Boleta: sin stock que descontar; se generan unidades tras el stock de merch
      if (item.tipo_boleta_id) {
        boletasPorGenerar.push({
          tipoId: item.tipo_boleta_id,
          eventoId: item.evento_id!,
          nombreTipo: item.nombre,
          cantidad: item.cantidad,
        })
        continue
      }
      if (item.variante_id) {
        if (item.cantidad <= 0) continue

        const { data: variant, error: variantError } = await supabase
          .from('producto_variantes')
          .select('stock')
          .eq('id', item.variante_id)
          .single()

        if (variantError || !variant) {
          throw new Error(`Variante no encontrada: ${item.variante_id}`)
        }
        if (variant.stock < item.cantidad) {
          await rollbackStock(supabase, deducted)
          await supabase.from('pedidos').update({ estado: 'rechazado' }).eq('id', pedido.id)
          await sendOrderDeclined({
            orderNumber: pedido.numero_pedido,
            customerName: pedido.nombre_entrega,
            email: pedido.email,
            reason: 'stock insuficiente al confirmar el pago',
          })
          return 'rechazado_stock'
        }

        deducted.push({
          variante_id: item.variante_id,
          stockBefore: await descontarStockItem(supabase, 'variante', item.variante_id, item.cantidad),
        })
      } else {
        if (item.cantidad <= 0) continue

        const { data: product, error: productError } = await supabase
          .from('productos')
          .select('stock')
          .eq('id', item.producto_id)
          .single()

        if (productError || !product) {
          throw new Error(`Producto no encontrado: ${item.producto_id}`)
        }
        if (product.stock < item.cantidad) {
          await rollbackStock(supabase, deducted)
          await supabase.from('pedidos').update({ estado: 'rechazado' }).eq('id', pedido.id)
          await sendOrderDeclined({
            orderNumber: pedido.numero_pedido,
            customerName: pedido.nombre_entrega,
            email: pedido.email,
            reason: 'stock insuficiente al confirmar el pago',
          })
          return 'rechazado_stock'
        }

        deducted.push({
          producto_id: item.producto_id,
          stockBefore: await descontarStockItem(supabase, 'producto', item.producto_id, item.cantidad),
        })
      }
    }
  } catch (err) {
    await rollbackStock(supabase, deducted)
    await restablecerPendiente(supabase, pedido.id)
    throw err
  }

  // Boletas: 1 por unidad comprada. El trigger DEFERRABLE de la BD garantiza
  // capacidad incluso si otro pago aprueba en paralelo; si falla, rollback de
  // las ya insertadas + pedido rechazado (terminal, con email de declinación).
  if (boletasPorGenerar.length > 0) {
    const emitidas: Array<{ codigo: string; tipoNombre: string }> = []
    try {
      for (const lb of boletasPorGenerar) {
        for (let i = 0; i < lb.cantidad; i++) {
          let codigo = ''
          for (let a = 0; a < 5; a++) {
            const candidato = generarCodigoBoleta()
            const { data: dup } = await supabase
              .from('boletas')
              .select('id')
              .eq('codigo', candidato)
              .maybeSingle()
            if (!dup) {
              codigo = candidato
              break
            }
          }
          if (!codigo) throw new Error('No se pudo generar un código único de boleta')

          const { error: insertError } = await supabase.from('boletas').insert({
            codigo,
            firma: firmarBoleta(codigo),
            pedido_id: pedido.id,
            tipo_id: lb.tipoId,
            evento_id: lb.eventoId,
            titular_nombre: pedido.nombre_entrega,
            titular_email: pedido.email,
            usuario_id: pedido.usuario_id ?? null,
            estado: 'valida',
          })
          if (insertError) throw new Error(insertError.message)
          emitidas.push({ codigo, tipoNombre: lb.nombreTipo })
        }
      }

      // Email con QR por boleta (no debe tumbar la aprobación)
      try {
        await sendTicketsEmail(
          {
            orderNumber: pedido.numero_pedido,
            customerName: pedido.nombre_entrega,
            email: pedido.email,
            boletas: emitidas,
          },
          supabase,
        )
      } catch (emailErr) {
        console.error('[Boletas] Error enviando email de boletas:', emailErr)
      }
    } catch (err) {
      await supabase.from('boletas').delete().eq('pedido_id', pedido.id)
      await supabase.from('pedidos').update({ estado: 'rechazado' }).eq('id', pedido.id)
      await sendOrderDeclined({
        orderNumber: pedido.numero_pedido,
        customerName: pedido.nombre_entrega,
        email: pedido.email,
        reason: 'capacidad agotada al emitir las boletas',
      })
      return 'rechazado_stock'
    }

    revalidatePath('/boletas', 'layout')
    revalidatePath('/cuenta/boletas')
  }

  // Revalidar página del producto y catálogo (el stock cambió).
  // ⚠️ Filtrar nulls: los items de boletería no tienen producto_id y PostgREST
  // rechaza `.in()` con nulls en el array (causó webhook 500 post-emisión).
  const productoIds = [...new Set(items.map((i) => i.producto_id).filter((id): id is string => Boolean(id)))]
  if (productoIds.length > 0) {
    const { data: productosAfectados } = await supabase
      .from('productos')
      .select('slug')
      .in('id', productoIds)

    for (const p of productosAfectados ?? []) {
      revalidatePath(`/tienda/${p.slug}`)
    }
    revalidatePath('/tienda')
  }

  return 'aprobado'
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

// Actualiza a un estado no aprobado con guard de idempotencia: solo actúa si el
// pedido sigue 'pendiente'. Devuelve false si otro proceso ya lo llevó a un
// estado terminal (no re-envía emails duplicados).
export async function procesarEstadoNoAprobado(
  supabase: SupabaseClient,
  pedido: PedidoParaPago,
  wompiStatus: WompiTransaction['status'],
  nuevoEstado: string,
): Promise<boolean> {
  const { data: actualizado, error: updateError } = await supabase
    .from('pedidos')
    .update({ estado: nuevoEstado })
    .eq('id', pedido.id)
    .eq('estado', 'pendiente')
    .select('id')
    .maybeSingle()

  if (updateError) throw new Error(`Error actualizando pedido: ${pedido.id}`)
  if (!actualizado) return false

  // Anula las boletas del pedido cuando el pedido cae a un estado terminal
  if (['rechazado', 'anulado', 'error'].includes(nuevoEstado)) {
    await anularBoletasPedido(supabase, pedido.id)
  }

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

  return true
}
// Anula las boletas activas de un pedido (pedido anulado/rechazado/cancelado).
export async function anularBoletasPedido(
  supabase: SupabaseClient,
  pedidoId: string,
): Promise<void> {
  const { data, error } = await supabase
    .from('boletas')
    .update({ estado: 'anulada' })
    .eq('pedido_id', pedidoId)
    .in('estado', ['valida'])
    .select('id')

  if (error) {
    console.error(`Error anulando boletas del pedido ${pedidoId}:`, error.message)
    return
  }
  if ((data?.length ?? 0) > 0) {
    revalidatePath('/boletas', 'layout')
    revalidatePath('/cuenta/boletas')
  }
}


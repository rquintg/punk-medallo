import { getSupabaseAdmin } from './supabase-admin'
import { sendStockAvailable } from '@/lib/email'
import { sitioUrl } from '@/lib/site-url'

// Cuando un producto vuelve a tener stock, notifica a todos los emails
// registrados en avisos_stock y LOS MARCA como notificados (no borra — el
// registro queda para contacto manual por WhatsApp). Se llama desde las actions
// de admin (updateProducto/updateVariante) cuando el stock pasa de 0 a >0.
// Avisos con talla/color solo se notifican cuando esa combinación específica
// tiene stock; avisos sin combinación (producto completo agotado) cuando el
// stock total pasa de 0. Los ya notificados se saltan (no re-envían email).
export async function notificarStockDisponible(productoId: string) {
  const supabase = getSupabaseAdmin()

  // Stock efectivo actual (variantes si existen, sino stock del producto)
  const { data: producto } = await (supabase
    .from('productos')
    .select('id, nombre, slug, stock, activo')
    .eq('id', productoId)
    .single() as any)

  if (!producto || !producto.activo) return

  const { data: variantes } = await (supabase
    .from('producto_variantes')
    .select('talla, color, stock')
    .eq('producto_id', productoId) as any)

  const variantesLista: Array<{ talla: string | null; color: string | null; stock: number }> =
    variantes ?? []

  const stockTotal = variantesLista.length > 0
    ? variantesLista.reduce((sum, v) => sum + (v.stock ?? 0), 0)
    : (producto.stock ?? 0)

  if (stockTotal <= 0) return

  const { data: avisos } = await (supabase
    .from('avisos_stock')
    .select('id, email, telefono, talla, color, notificado_at')
    .eq('producto_id', productoId) as any)

  if (!avisos || avisos.length === 0) return

  const siteUrl = sitioUrl()
  const productUrl = `${siteUrl}/tienda/${producto.slug}`

  const notificados: string[] = []

  for (const aviso of avisos) {
    if (aviso.notificado_at) continue
    // Aviso de combinación específica: solo notifica si esa combo tiene stock
    if (aviso.talla) {
      const disponible = variantesLista.some(
        (v) =>
          v.talla === aviso.talla &&
          (aviso.color ? v.color === aviso.color : true) &&
          (v.stock ?? 0) > 0,
      )
      if (!disponible) continue
    } else if (stockTotal <= 0) {
      continue
    }

    const nombre = (aviso.email ?? '').split('@')[0] || 'Amig@'
    const comboLabel = [aviso.color, aviso.talla].filter(Boolean).join(' / ') || null
    try {
      await sendStockAvailable({
        customerName: nombre,
        email: aviso.email,
        productName: producto.nombre,
        productUrl,
        comboLabel,
      })
      notificados.push(aviso.id)
    } catch (emailError) {
      console.error('notificarStockDisponible email error:', emailError)
    }
  }

  // Marca como notificados (no borra — el registro queda para contacto manual)
  if (notificados.length > 0) {
    await (supabase
      .from('avisos_stock') as any)
      .update({ notificado_at: new Date().toISOString() })
      .in('id', notificados)
  }
}
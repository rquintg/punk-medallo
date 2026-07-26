import { notFound } from 'next/navigation'
import { ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import AdminHeader from '@/components/admin/admin-header'
import StatusBadge from '@/components/admin/status-badge'
import { getOrdenByNumero } from '@/features/admin/services/ordenes'
import { actualizarEstadoOrden, deleteOrden } from '@/features/admin/actions/ordenes'
import { getProductoImageUrl } from '@/lib/supabase-storage'

interface Props {
  params: Promise<{ numero_pedido: string }>
}

const TRANSICIONES: Record<string, string[]> = {
  pendiente: ['aprobado', 'rechazado'],
  aprobado: ['preparando', 'cancelado'],
  preparando: ['enviado'],
  enviado: ['entregado'],
  entregado: [],
  rechazado: [],
  cancelado: [],
  pagado: ['enviado'],
  anulado: [],
  error: [],
}

export default async function OrdenDetallePage({ params }: Props) {
  const { numero_pedido } = await params
  const orden = await getOrdenByNumero(numero_pedido)

  if (!orden) notFound()

  return (
    <>
      <AdminHeader
        title={`Orden ${orden.numero_pedido}`}
        description={`Creada el ${new Date(orden.created_at).toLocaleDateString('es-CO', {
          dateStyle: 'long',
        })}`}
      >
        <Link
          href="/admin/ordenes"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--admin-card-border)] text-[var(--admin-text-muted)] text-sm font-medium hover:bg-[var(--admin-hover)] transition-colors"
        >
          <ArrowLeft size={16} />
          Volver
        </Link>
      </AdminHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--admin-card)] border border-[var(--admin-card-border)] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[var(--admin-text)] mb-4">Productos</h2>
            <div className="space-y-4">
              {orden.pedido_items.length === 0 && (
                <p className="text-[var(--admin-text-dim)]">Sin productos</p>
              )}
              {orden.pedido_items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <img
                    src={getProductoImageUrl(item.productos?.slug ?? '')}
                    alt={item.productos?.nombre ?? ''}
                    className="w-14 h-14 rounded-lg object-cover bg-[var(--admin-hover)]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--admin-text)] truncate">
                      {item.productos?.nombre ?? 'Producto eliminado'}
                    </p>
                    <p className="text-xs text-[var(--admin-text-dim)]">
                      {item.cantidad} × ${item.precio.toLocaleString('es-CO')}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-[var(--admin-text)]">
                    ${(item.cantidad * item.precio).toLocaleString('es-CO')}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--admin-card-border)] flex justify-between items-center">
              <span className="text-sm font-medium text-[var(--admin-text-muted)]">Total</span>
              <span className="text-xl font-bold text-[var(--admin-text)]">
                ${orden.total.toLocaleString('es-CO')}
              </span>
            </div>
          </div>

          <div className="bg-[var(--admin-card)] border border-[var(--admin-card-border)] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[var(--admin-text)] mb-4">Actualizar estado</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge status={orden.estado} />
              {TRANSICIONES[orden.estado.toLowerCase()]?.length === 0 && (
                <span className="text-sm text-[var(--admin-text-dim)]">Estado final</span>
              )}
              {TRANSICIONES[orden.estado.toLowerCase()]?.map((estado) => (
                <form key={estado} action={async () => {
                  'use server'
                  await actualizarEstadoOrden(orden.numero_pedido, estado)
                }}>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[var(--admin-accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Marcar como {estado}
                  </button>
                </form>
              ))}
            </div>
          </div>

          <form action={async () => {
            'use server'
            await deleteOrden(orden.numero_pedido)
          }}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors"
            >
              <Trash2 size={16} />
              Eliminar orden
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--admin-card)] border border-[var(--admin-card-border)] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[var(--admin-text)] mb-4">Cliente</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-[var(--admin-text-dim)]">Nombre</dt>
                <dd className="text-[var(--admin-text)] font-medium">{orden.nombre_entrega}</dd>
              </div>
              <div>
                <dt className="text-[var(--admin-text-dim)]">Email</dt>
                <dd className="text-[var(--admin-text)]">{orden.email}</dd>
              </div>
              <div>
                <dt className="text-[var(--admin-text-dim)]">Teléfono</dt>
                <dd className="text-[var(--admin-text)]">{orden.telefono}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-[var(--admin-card)] border border-[var(--admin-card-border)] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[var(--admin-text)] mb-4">Dirección</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-[var(--admin-text-dim)]">Dirección</dt>
                <dd className="text-[var(--admin-text)]">{orden.direccion}</dd>
              </div>
              <div>
                <dt className="text-[var(--admin-text-dim)]">Ciudad</dt>
                <dd className="text-[var(--admin-text)]">{orden.ciudad}</dd>
              </div>
            </dl>
          </div>


        </div>
      </div>
    </>
  )
}

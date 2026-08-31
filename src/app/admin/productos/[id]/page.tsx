import { notFound } from 'next/navigation'
import AdminHeader from '@/components/admin/admin-header'
import ProductoForm from '@/components/admin/producto-form'
import VariantesManager from '@/components/admin/variantes-manager'
import ImagenesManager from '@/components/admin/imagenes-manager'
import { AvisosManager } from '@/components/admin/avisos-manager'
import { getProductoById } from '@/features/admin/services/productos'
import { getCategorias } from '@/features/admin/services/categorias'
import { getVariantesByProducto } from '@/features/admin/services/variantes'
import { getRolActual, getUsuarioActual, requirePermission } from '@/features/admin/utils/auth-server'
import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarProductoPage({ params }: Props) {
  const { id } = await params
  await requirePermission('edit_products')

  const [producto, categorias, variantes] = await Promise.all([
    getProductoById(id),
    getCategorias(),
    getVariantesByProducto(id),
  ])

  if (!producto) notFound()
  const rol = await getRolActual()
  if (rol === 'publicador') {
    const usuario = await getUsuarioActual()
    if (!usuario || producto.owner_id !== usuario.id) redirect('/admin/productos')
  }

  return (
    <>
      <AdminHeader
        title={`Editar: ${producto.nombre}`}
        description="Modifica los datos del producto"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-bold ${
              producto.activo
                ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
                : 'border-[var(--admin-card-border)] bg-[var(--admin-hover)] text-[var(--admin-text-dim)]'
            }`}
          >
            {producto.activo ? 'Activo' : 'Inactivo'}
          </span>
          {producto.stock_efectivo <= 0 ? (
            <span className="rounded-full border border-red-500/30 bg-red-500/15 px-3 py-1 text-xs font-bold text-red-400">
              Agotado
            </span>
          ) : producto.stock_efectivo < 10 ? (
            <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-400">
              Stock bajo ({producto.stock_efectivo})
            </span>
          ) : null}
        </div>
      </AdminHeader>

      <ProductoForm categorias={categorias} producto={producto} variantesCount={variantes.length} />
      <div className="mt-6 space-y-6">
        <ImagenesManager
          productoId={id}
          slug={producto.slug}
          imagenes={producto.producto_imagenes ?? []}
          coloresDisponibles={producto.colores_disponibles}
        />
        <VariantesManager
          productoId={id}
          initialVariants={variantes}
          coloresDisponibles={producto.colores_disponibles}
        />
        <AvisosManager productoId={id} />
      </div>
    </>
  )
}
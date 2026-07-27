import { notFound } from 'next/navigation'
import AdminHeader from '@/components/admin/admin-header'
import ProductoForm from '@/components/admin/producto-form'
import VariantesManager from '@/components/admin/variantes-manager'
import ImagenesManager from '@/components/admin/imagenes-manager'
import { getProductoById } from '@/features/admin/services/productos'
import { getCategorias } from '@/features/admin/services/categorias'
import { getVariantesByProducto } from '@/features/admin/services/variantes'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarProductoPage({ params }: Props) {
  const { id } = await params
  const producto = await getProductoById(id)
  const categorias = await getCategorias()

  if (!producto) notFound()

  const variantes = await getVariantesByProducto(id)

  return (
    <>
      <AdminHeader
        title={`Editar: ${producto.nombre}`}
        description="Modifica los datos del producto"
      />
      <div className="space-y-6">
        <ProductoForm categorias={categorias} producto={producto} />
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
      </div>
    </>
  )
}

import AdminHeader from '@/components/admin/admin-header'
import ProductoForm from '@/components/admin/producto-form'
import { getCategorias } from '@/features/admin/services/categorias'
import { requirePermission } from '@/features/admin/utils/auth-server'

export default async function NuevoProductoPage() {
  await requirePermission('create_products')

  const categorias = await getCategorias()

  return (
    <>
      <AdminHeader
        title="Nuevo producto"
        description="Agrega un producto al catálogo"
      />
      <ProductoForm categorias={categorias} />
    </>
  )
}
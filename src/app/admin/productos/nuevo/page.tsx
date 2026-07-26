import AdminHeader from '@/components/admin/admin-header'
import ProductoForm from '@/components/admin/producto-form'
import { getCategorias } from '@/features/admin/services/categorias'

export default async function NuevoProductoPage() {
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

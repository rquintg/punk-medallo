import AdminHeader from '@/components/admin/admin-header'
import { getCategorias } from '@/features/admin/services/categorias'
import CategoriasTable from './categorias-table'
import { NuevaCategoriaForm } from './acciones-categoria'

export default async function AdminCategoriasPage() {
  const data = await getCategorias()

  return (
    <>
      <AdminHeader
        title="Categorías"
        description="Gestiona las categorías de productos"
      >
        <NuevaCategoriaForm />
      </AdminHeader>
      <CategoriasTable data={data} />
    </>
  )
}

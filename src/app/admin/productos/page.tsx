import { Suspense } from 'react'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import AdminHeader from '@/components/admin/admin-header'
import { getProductos } from '@/features/admin/services/productos'
import SearchInput from './search-input'
import ProductosTable from './productos-table'

interface Props {
  searchParams: Promise<{ page?: string; q?: string }>
}

const PAGE_SIZE = 20

export default async function AdminProductosPage({ searchParams }: Props) {
  const { page: pageStr, q } = await searchParams
  const page = Math.max(1, Number(pageStr) || 1)
  const { data, total } = await getProductos(page, q, PAGE_SIZE)

  return (
    <>
      <AdminHeader
        title="Productos"
        description="Gestiona el catálogo de productos"
      >
        <Link
          href="/admin/productos/nuevo"
          className="btn-primary"
        >
          <Plus size={16} />
          Nuevo producto
        </Link>
      </AdminHeader>

      <Suspense fallback={null}>
        <SearchInput />
      </Suspense>

      <ProductosTable data={data} total={total} page={page} />
    </>
  )
}

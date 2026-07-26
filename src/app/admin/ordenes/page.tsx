import { Suspense } from 'react'
import AdminHeader from '@/components/admin/admin-header'
import { getOrdenes } from '@/features/admin/services/ordenes'
import FiltroEstado from './filtro-estado'
import OrdenesTable from './ordenes-table'

interface Props {
  searchParams: Promise<{ page?: string; estado?: string }>
}

const PAGE_SIZE = 20

export default async function AdminOrdenesPage({ searchParams }: Props) {
  const { page: pageStr, estado } = await searchParams
  const page = Math.max(1, Number(pageStr) || 1)
  const { data, total } = await getOrdenes(page, estado, PAGE_SIZE)

  return (
    <>
      <AdminHeader
        title="Órdenes"
        description="Gestiona los pedidos de los clientes"
      />

      <Suspense fallback={null}>
        <FiltroEstado />
      </Suspense>

      <OrdenesTable data={data} total={total} page={page} />
    </>
  )
}

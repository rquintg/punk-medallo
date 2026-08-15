import type { Metadata } from 'next'
import AdminHeader from '@/components/admin/admin-header'
import { requirePermission } from '@/features/admin/utils/auth-server'
import { getCupones } from '@/features/admin/services/cupones'
import CuponesTable from './cupones-table'
import { NuevaCuponForm } from './acciones-cupon'

export const metadata: Metadata = {
  title: 'Cupones | Admin Punk Medallo',
}

export default async function AdminCuponesPage() {
  await requirePermission('manage_cupones')
  const data = await getCupones()

  return (
    <>
      <AdminHeader
        title="Cupones"
        description="Crea cupones de descuento para la tienda (máximo 1 uso por correo)"
      >
        <NuevaCuponForm />
      </AdminHeader>
      <CuponesTable data={data} />
    </>
  )
}
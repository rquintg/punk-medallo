import type { Metadata } from 'next'
import { requirePermission } from '@/features/admin/utils/auth-server'
import AdminHeader from '@/components/admin/admin-header'
import EscanerClient from './escaner-client'

export const metadata: Metadata = {
  title: 'Escaner de boletas',
  robots: { index: false, follow: false },
}

export default async function EscanerPage() {
  await requirePermission('manage_boleteria')

  return (
    <div className="mx-auto max-w-xl">
      <AdminHeader
        title="Escáner de boletas"
        description="Apunta la cámara al QR de la boleta. Cada QR se acepta una sola vez."
      />
      <EscanerClient />
    </div>
  )
}

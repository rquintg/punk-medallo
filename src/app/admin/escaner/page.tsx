import type { Metadata } from 'next'
import { requirePermission } from '@/features/admin/utils/auth-server'
import { listarEventosActivos } from '@/features/boletas/services/public'
import AdminHeader from '@/components/admin/admin-header'
import EscanerClient from './escaner-client'

export const metadata: Metadata = {
  title: 'Escaner de boletas',
  robots: { index: false, follow: false },
}

export default async function EscanerPage() {
  await requirePermission('manage_boleteria')
  const eventos = await listarEventosActivos()

  return (
    <div className="mx-auto max-w-xl">
      <AdminHeader
        title="Escáner de boletas"
        description="Selecciona el evento, apunta la cámara al QR. Cada QR se acepta una sola vez."
      />
      <EscanerClient
        eventos={eventos.map((e) => ({
          id: e.id,
          titulo: e.titulo,
          fechaStr: new Date(e.fechaEvento).toLocaleDateString('es-CO', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          }),
        }))}
      />
    </div>
  )
}

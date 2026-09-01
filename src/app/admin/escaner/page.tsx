import type { Metadata } from 'next'
import { getRolActual, getUsuarioActual, requirePermission } from '@/features/admin/utils/auth-server'
import { listarEventosActivos } from '@/features/boletas/services/public'
import { getEventosAdmin } from '@/features/boletas/services/admin'
import AdminHeader from '@/components/admin/admin-header'
import EscanerClient from './escaner-client'

export const metadata: Metadata = {
  title: 'Escaner de boletas',
  robots: { index: false, follow: false },
}

export default async function EscanerPage() {
  await requirePermission('manage_boleteria')
  const rol = await getRolActual()
  let eventos: Array<{ id: string; titulo: string; fechaEvento: string }> = []
  if (rol === 'publicador') {
    const ownerId = (await getUsuarioActual())?.id ?? null
    const adminEventos = await getEventosAdmin(ownerId)
    const ahora = Date.now()
    eventos = adminEventos.filter((e) => e.activo && new Date(e.fechaEvento).getTime() >= ahora).map((e) => ({ id: e.id, titulo: e.titulo, fechaEvento: e.fechaEvento }))
  } else {
    eventos = await listarEventosActivos()
  }

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

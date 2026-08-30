import type { Metadata } from 'next'
import AdminHeader from '@/components/admin/admin-header'
import { requirePermission } from '@/features/admin/utils/auth-server'
import EventoForm from '../evento-form'

export const metadata: Metadata = { title: 'Nuevo evento — Boletería' }

export default async function NuevoEventoPage() {
  await requirePermission('manage_boleteria')

  return (
    <div className="mx-auto max-w-3xl">
      <AdminHeader title="Nuevo evento" description="Boletería — crea el evento y luego agrega los tipos de boleta" />
      <EventoForm />
    </div>
  )
}

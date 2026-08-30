import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import AdminHeader from '@/components/admin/admin-header'
import { requirePermission } from '@/features/admin/utils/auth-server'
import { getEventoAdminById } from '@/features/boletas/services/admin'
import EventoForm from '../evento-form'
import TiposManager from '../tipos-manager'

export const metadata: Metadata = { title: 'Editar evento — Boletería' }

export default async function EditarEventoPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission('manage_boleteria')
  const { id } = await params
  const data = await getEventoAdminById(id)
  if (!data) notFound()

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/boletos"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--admin-text-muted)] transition-colors hover:text-[var(--admin-text)]"
      >
        <ArrowLeft size={15} />
        Volver a boletería
      </Link>

      <AdminHeader title={data.evento.titulo} description={`Boletería — ${data.evento.lugar}`} />

      <div className="space-y-6">
        <TiposManager eventoId={data.evento.id} tipos={data.tipos} />
        <EventoForm initial={data.evento} />
      </div>
    </div>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarDays, Plus } from 'lucide-react'
import AdminHeader from '@/components/admin/admin-header'
import { requirePermission } from '@/features/admin/utils/auth-server'
import { getEventosAdmin } from '@/features/boletas/services/admin'
import DesactivarEventoButton from './desactivar-evento-button'
import { formatBogota } from '@/lib/format-bogota'

export const metadata: Metadata = { title: 'Boletería — Eventos' }

const fechaFmt = (iso: string) =>
  formatBogota(iso, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export default async function AdminBoletosPage() {
  await requirePermission('manage_boleteria')
  const eventos = await getEventosAdmin()
  // eslint-disable-next-line react-hooks/purity -- per-request server time for "Pasado" badge
  const ahora = Date.now()

  return (
    <div>
      <AdminHeader
        title="Boletería"
        description="Eventos con venta de boletas. Crea el evento, define tipos y cantidades."
      >
        <Link
          href="/admin/boletos/nuevo"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--admin-accent)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Plus size={16} />
          Nuevo evento
        </Link>
      </AdminHeader>

      {eventos.length === 0 ? (
        <div className="card-section flex flex-col items-center gap-3 py-16 text-center">
          <CalendarDays size={40} className="text-[var(--admin-text-dim)]" />
          <p className="font-medium text-[var(--admin-text)]">No hay eventos todavía</p>
          <p className="text-sm text-[var(--admin-text-muted)]">
            Crea tu primer evento para empezar a vender boletas.
          </p>
        </div>
      ) : (
        <div className="card-section overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-[var(--admin-card-border)] text-left">
                <th className="pb-3 pr-4 font-semibold uppercase tracking-wider text-xs text-[var(--admin-text-dim)]">Evento</th>
                <th className="pb-3 pr-4 font-semibold uppercase tracking-wider text-xs text-[var(--admin-text-dim)]">Fecha</th>
                <th className="pb-3 pr-4 font-semibold uppercase tracking-wider text-xs text-[var(--admin-text-dim)]">Lugar</th>
                <th className="pb-3 pr-4 font-semibold uppercase tracking-wider text-xs text-[var(--admin-text-dim)]">Tipos</th>
                <th className="pb-3 pr-4 font-semibold uppercase tracking-wider text-xs text-[var(--admin-text-dim)]">Estado</th>
                <th className="pb-3 font-semibold uppercase tracking-wider text-xs text-[var(--admin-text-dim)]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {eventos.map((e) => {
                const pasado = new Date(e.fechaEvento).getTime() < ahora
                return (
                  <tr key={e.id} className="border-b border-[var(--admin-card-border)] last:border-0">
                    <td className="py-3 pr-4">
                      <Link href={`/admin/boletos/${e.id}`} className="font-medium text-[var(--admin-text)] hover:text-[var(--admin-accent)]">
                        {e.titulo}
                      </Link>
                      <p className="font-mono text-xs text-[var(--admin-text-dim)]">{e.slug}</p>
                    </td>
                    <td className="py-3 pr-4 text-[var(--admin-text-muted)]">{fechaFmt(e.fechaEvento)}</td>
                    <td className="py-3 pr-4 text-[var(--admin-text-muted)]">{e.lugar}</td>
                    <td className="py-3 pr-4 text-[var(--admin-text-muted)]">{e.totalTipos}</td>
                    <td className="py-3 pr-4">
                      {!e.activo ? (
                        <span className="rounded-full border border-neutral-700 px-2 py-0.5 text-xs text-neutral-400">Inactivo</span>
                      ) : pasado ? (
                        <span className="rounded-full border border-neutral-700 bg-neutral-800 px-2 py-0.5 text-xs text-neutral-300">Pasado</span>
                      ) : (
                        <span className="rounded-full border border-emerald-600/50 bg-emerald-950/30 px-2 py-0.5 text-xs text-emerald-400">En venta</span>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/boletos/${e.id}`}
                          className="text-xs font-medium text-[var(--admin-accent)] hover:underline"
                        >
                          Editar
                        </Link>
                        {e.activo && <DesactivarEventoButton id={e.id} titulo={e.titulo} />}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

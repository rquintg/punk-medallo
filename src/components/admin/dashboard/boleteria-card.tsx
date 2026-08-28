import Link from 'next/link'
import { CalendarDays, Ticket } from 'lucide-react'
import DashboardCard from './dashboard-card'
import type { BoleteriaStatsEvento } from '@/features/boletas/services/stats'
import Price from '@/components/tienda/price'

/**
 * Sección Boletería del dashboard: vendidas/usadas/ingresos por evento (T7).
 */
export default function BoleteriaCard({ stats }: { stats: BoleteriaStatsEvento[] }) {
  return (
    <DashboardCard icon={Ticket} title="Boletería">
      {stats.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <CalendarDays size={32} className="text-[var(--admin-text-dim)]" />
          <p className="text-sm text-[var(--admin-text-muted)]">
            Sin eventos de boletería todavía.
          </p>
          <Link
            href="/admin/boletos"
            className="text-xs font-medium text-[var(--admin-accent)] hover:underline"
          >
            Crear el primero →
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-[var(--admin-card-border)] text-left text-xs uppercase tracking-wider text-[var(--admin-text-dim)]">
                <th className="pb-2 pr-4">Evento</th>
                <th className="pb-2 pr-4">Fecha</th>
                <th className="pb-2 pr-4">Vendidas</th>
                <th className="pb-2 pr-4">Escaneadas</th>
                <th className="pb-2 pr-4">Cupo</th>
                <th className="pb-2">Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((e) => {
                const pct = e.totalCupo > 0 ? Math.round((e.vendidas / e.totalCupo) * 100) : 0
                return (
                  <tr key={e.eventoId} className="border-b border-[var(--admin-card-border)] last:border-0">
                    <td className="py-2.5 pr-4">
                      <Link href={`/admin/boletos/${e.eventoId}`} className="font-medium text-[var(--admin-text)] hover:text-[var(--admin-accent)]">
                        {e.titulo}
                      </Link>
                      {!e.activo && (
                        <span className="ml-2 rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] uppercase text-neutral-400">
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 pr-4 text-[var(--admin-text-muted)]">
                      {new Date(e.fechaEvento).toLocaleDateString('es-CO', { timeZone: 'America/Bogota', day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="font-semibold text-[var(--admin-text)]">{e.vendidas}</span>
                      <span className="ml-1.5 text-xs text-[var(--admin-text-dim)]">({pct}%)</span>
                    </td>
                    <td className="py-2.5 pr-4 text-[var(--admin-text-muted)]">{e.usadas}</td>
                    <td className="py-2.5 pr-4 text-[var(--admin-text-muted)]">{e.totalCupo}</td>
                    <td className="py-2.5 font-semibold text-emerald-400">
                      <Price amount={e.ingresos ?? 0} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <Link
            href="/admin/boletos"
            className="mt-4 inline-block text-xs font-medium text-[var(--admin-accent)] hover:underline"
          >
            Gestionar boletería →
          </Link>
        </div>
      )}
    </DashboardCard>
  )
}

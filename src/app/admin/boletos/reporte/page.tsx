import type { Metadata } from 'next'
import Link from 'next/link'
import { Ticket, CalendarDays } from 'lucide-react'
import AdminHeader from '@/components/admin/admin-header'
import { requirePermission } from '@/features/admin/utils/auth-server'
import { getBoletasPorEvento, getEventosParaReporte, formatearBogota } from '@/features/boletas/services/reporte'
import ReporteFilters from './reporte-filters'
import ExportButton from './export-button'
import { formatBogota } from '@/lib/format-bogota'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Boletería — Informe' }

const PAGE_SIZE = 50

const estadoBadge: Record<string, string> = {
  valida: 'border-emerald-600/50 bg-emerald-950/30 text-emerald-400',
  usada: 'border-neutral-600 bg-neutral-800 text-neutral-300',
  anulada: 'border-red-700/40 bg-red-950/30 text-red-300',
}

export default async function ReporteBoletasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requirePermission('manage_boleteria')
  const sp = await searchParams
  const eventoId = typeof sp.evento === 'string' ? sp.evento : ''
  const estado = typeof sp.estado === 'string' ? sp.estado : 'todos'
  const q = typeof sp.q === 'string' ? sp.q : ''
  const page = Math.max(1, Number(sp.page ?? 1) || 1)

  const eventos = await getEventosParaReporte()

  let data: Awaited<ReturnType<typeof getBoletasPorEvento>> | null = null
  if (eventoId) {
    try {
      data = await getBoletasPorEvento({ eventoId, page, pageSize: PAGE_SIZE, estado, q })
    } catch (e) {
      console.error('Reporte boletas error:', e)
    }
  }

  const eventoSel = eventos.find((e) => e.id === eventoId)

  return (
    <div>
      <AdminHeader title="Informe de boletería" description="Elige un evento para ver el log completo de boletas, escaneos y exportar a Sheets.">
        {eventoId && <ExportButton eventoId={eventoId} disabled={!data || data.total === 0} />}
      </AdminHeader>

      <div className="card-section">
        <ReporteFilters eventos={eventos} defaultEvento={eventoId} defaultEstado={estado} defaultQ={q} />
        {!eventoId && (
          <p className="mt-4 text-sm text-[var(--admin-text-muted)]">Selecciona un evento arriba para cargar el informe. <code>/admin/boletos</code> sigue siendo solo para crear/editar eventos.</p>
        )}
      </div>

      {eventoId && eventoSel && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="card-section py-3">
            <p className="text-xs uppercase tracking-wider text-[var(--admin-text-dim)]">Cupo</p>
            <p className="text-lg font-bold text-[var(--admin-text)]">{data?.resumen.cupo ?? '-'}</p>
          </div>
          <div className="card-section py-3">
            <p className="text-xs uppercase tracking-wider text-[var(--admin-text-dim)]">Vendidas</p>
            <p className="text-lg font-bold text-[var(--admin-text)]">{data?.resumen.totalBoletas ?? 0}</p>
            <p className="text-xs text-[var(--admin-text-dim)]">Validas {data?.resumen.validas ?? 0} · Usadas {data?.resumen.usadas ?? 0} · Anuladas {data?.resumen.anuladas ?? 0}</p>
          </div>
          <div className="card-section py-3">
            <p className="text-xs uppercase tracking-wider text-[var(--admin-text-dim)]">Usadas</p>
            <p className="text-lg font-bold text-emerald-400">{data?.resumen.usadas ?? 0}</p>
          </div>
          <div className="card-section py-3">
            <p className="text-xs uppercase tracking-wider text-[var(--admin-text-dim)]">Anuladas</p>
            <p className="text-lg font-bold text-red-300">{data?.resumen.anuladas ?? 0}</p>
          </div>
          <div className="card-section py-3">
            <p className="text-xs uppercase tracking-wider text-[var(--admin-text-dim)]">Evento</p>
            <p className="truncate text-sm font-semibold text-[var(--admin-text)]">{eventoSel.titulo}</p>
            <p className="text-xs text-[var(--admin-text-dim)]">{eventoSel.lugar} · {formatBogota(eventoSel.fechaEvento, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
      )}

      {eventoId && data && (
        <div className="card-section mt-6 overflow-x-auto">
          {data.rows.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Ticket size={32} className="text-[var(--admin-text-dim)]" />
              <p className="text-sm text-[var(--admin-text-muted)]">Sin boletas con esos filtros.</p>
            </div>
          ) : (
            <>
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-[var(--admin-card-border)] text-left text-xs uppercase tracking-wider text-[var(--admin-text-dim)]">
                    <th className="pb-2 pr-3">Código</th>
                    <th className="pb-2 pr-3">Tipo</th>
                    <th className="pb-2 pr-3">Titular</th>
                    <th className="pb-2 pr-3">Pedido</th>
                    <th className="pb-2 pr-3">Estado</th>
                    <th className="pb-2 pr-3">Comprada</th>
                    <th className="pb-2 pr-3">Escaneada</th>
                    <th className="pb-2">Escaneada por</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((r) => (
                    <tr key={r.id} className="border-b border-[var(--admin-card-border)] last:border-0">
                      <td className="py-2.5 pr-3 font-mono text-xs font-semibold text-[var(--admin-accent)]">{r.codigo}</td>
                      <td className="py-2.5 pr-3 text-[var(--admin-text-muted)]">{r.tipoNombre}</td>
                      <td className="py-2.5 pr-3">
                        <p className="font-medium text-[var(--admin-text)]">{r.titularNombre}</p>
                        <p className="text-xs text-[var(--admin-text-dim)]">{r.titularEmail}</p>
                      </td>
                      <td className="py-2.5 pr-3 font-mono text-xs text-[var(--admin-text-muted)]">{r.numeroPedido ?? r.pedidoId.slice(0, 8)}</td>
                      <td className="py-2.5 pr-3">
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${estadoBadge[r.estado] ?? 'border-neutral-700 text-neutral-400'}`}>{r.estado}</span>
                      </td>
                      <td className="py-2.5 pr-3 text-xs text-[var(--admin-text-muted)]">{formatearBogota(r.createdAt)}</td>
                      <td className="py-2.5 pr-3 text-xs text-[var(--admin-text-muted)]">{formatearBogota(r.escaneadaEn)}</td>
                      <td className="py-2.5 text-xs text-[var(--admin-text-muted)]">{r.escaneadaPorEmail ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 flex items-center justify-between text-xs text-[var(--admin-text-dim)]">
                <span>
                  {data.total} boletas · página {page} de {Math.max(1, Math.ceil(data.total / PAGE_SIZE))}
                </span>
                <div className="flex gap-2">
                  {page > 1 && (
                    <Link href={`?evento=${eventoId}&estado=${estado}&q=${encodeURIComponent(q)}&page=${page - 1}`} className="rounded border border-[var(--admin-card-border)] px-3 py-1.5 hover:bg-[var(--admin-hover)]">
                      Anterior
                    </Link>
                  )}
                  {page * PAGE_SIZE < data.total && (
                    <Link href={`?evento=${eventoId}&estado=${estado}&q=${encodeURIComponent(q)}&page=${page + 1}`} className="rounded border border-[var(--admin-card-border)] px-3 py-1.5 hover:bg-[var(--admin-hover)]">
                      Siguiente
                    </Link>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {!data && eventoId && (
        <div className="card-section mt-6 flex items-center gap-2 py-8 text-sm text-amber-300">
          <CalendarDays size={16} /> No se pudo cargar el informe. Verifica el ID del evento.
        </div>
      )}
    </div>
  )
}

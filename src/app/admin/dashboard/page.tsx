import {
  AlertTriangle,
  Banknote,
  BarChart3,
  ClipboardList,
  CreditCard,
  DollarSign,
  PieChart,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  Ticket,
  TrendingUp,
  Trophy,
  Truck,
} from 'lucide-react'
import Link from 'next/link'
import {
  getDashboardAnalytics,
  RANGOS,
  type RangoDias,
} from '@/features/admin/services/dashboard'
import AdminHeader from '@/components/admin/admin-header'
import KpiCard from '@/components/admin/dashboard/kpi-card'
import DashboardCard from '@/components/admin/dashboard/dashboard-card'
import RangoSelector from '@/components/admin/dashboard/rango-selector'
import BoleteriaCard from '@/components/admin/dashboard/boleteria-card'
import { getBoleteriaStats } from '@/features/boletas/services/stats'
import ChartIngresos from '@/components/admin/dashboard/chart-ingresos'
import ChartOrdenesDia from '@/components/admin/dashboard/chart-ordenes-dia'
import ChartDonut from '@/components/admin/dashboard/chart-donut'
import ChartEstados from '@/components/admin/dashboard/chart-estados'
import TopProductos from '@/components/admin/dashboard/top-productos'
import EmptyChart from '@/components/admin/dashboard/empty-chart'
import StatusBadge from '@/components/admin/status-badge'
import { metodoPagoLabel } from '@/lib/metodo-pago'
import { formatearCOPCompleto } from '@/components/admin/dashboard/chart-theme'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const ETIQUETA_RANGO: Record<RangoDias, string> = { 7: '7 días', 30: '30 días', 90: '90 días' }

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  const params = await searchParams
  const rangoParam = Number(params.rango)
  const rango: RangoDias = (RANGOS as number[]).includes(rangoParam) ? (rangoParam as RangoDias) : 30
  const [analytics, boleteriaStats] = await Promise.all([
    getDashboardAnalytics(rango),
    getBoleteriaStats().catch(() => []),
  ])

  const conVentas = analytics.totalIngresos > 0
  const etiqueta = ETIQUETA_RANGO[rango]

  return (
    <>
      <AdminHeader
        title="Dashboard"
        description={`Ventas y operación de Punk Medallo · últimos ${etiqueta}`}
      >
        <RangoSelector />
      </AdminHeader>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label={`Ingresos · ${etiqueta}`}
          value={analytics.totalIngresos}
          icon={DollarSign}
          color="green"
          money
          delta={analytics.deltaIngresos}
        />
        <KpiCard
          label={`Órdenes · ${etiqueta}`}
          value={analytics.totalOrdenes}
          icon={ShoppingBag}
          color="blue"
          delta={analytics.deltaOrdenes}
        />
        <KpiCard
          label="Ticket promedio"
          value={analytics.ticketPromedio}
          icon={ReceiptText}
          color="zinc"
          money
          delta={analytics.deltaTicket}
        />
        <KpiCard
          label="Por enviar"
          value={analytics.porEnviar}
          icon={Truck}
          color="amber"
          sub="pendientes, aprobados y en preparación"
        />
        <KpiCard
          label="Contra entrega por cobrar"
          value={analytics.contraEntregaPorCobrar}
          icon={Banknote}
          color="amber"
          money
          sub={`${analytics.contraEntregaPedidos} pedido${analytics.contraEntregaPedidos !== 1 ? 's' : ''} — confirma por teléfono antes de despachar`}
        />
        <KpiCard
          label="Stock bajo"
          value={analytics.stockBajo}
          icon={AlertTriangle}
          color="red"
          sub="productos con menos de 10 unidades"
        />
        <KpiCard
          label="Cupones usados"
          value={analytics.cuponesUsados}
          icon={Ticket}
          color="zinc"
          sub={analytics.cuponesDescontado > 0
            ? `descontado: ${formatearCOPCompleto(analytics.cuponesDescontado)}`
            : undefined}
        />
        <KpiCard
          label="Políticas aceptadas"
          value={analytics.politicasPct}
          icon={ShieldCheck}
          color="green"
          suffix="%"
          sub="pedidos con aceptación de políticas"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <DashboardCard
            icon={TrendingUp}
            title="Ingresos"
            right={
              <span className="text-xs text-[var(--admin-text-dim)]">
                vs periodo anterior{' '}
                {analytics.deltaIngresos !== null ? (
                  <b className={analytics.deltaIngresos >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {analytics.deltaIngresos >= 0 ? '+' : '−'}
                    {Math.abs(analytics.deltaIngresos)}%
                  </b>
                ) : (
                  '—'
                )}
              </span>
            }
          >
            {conVentas ? <ChartIngresos serie={analytics.serie} /> : <EmptyChart title={`Sin ventas en los últimos ${etiqueta}`} />}
          </DashboardCard>
        </div>

        <div className="lg:col-span-4">
          <DashboardCard icon={Trophy} title="Top productos" right={<span className="text-xs text-[var(--admin-text-dim)]">por ingresos</span>}>
            <TopProductos
              productos={analytics.topProductos}
              maxIngresos={analytics.topProductos[0]?.ingresos ?? 0}
            />
          </DashboardCard>
        </div>

        <div className="lg:col-span-4">
          <DashboardCard icon={BarChart3} title="Órdenes por día">
            {conVentas ? <ChartOrdenesDia serie={analytics.serie} /> : <EmptyChart />}
          </DashboardCard>
        </div>

        <div className="lg:col-span-4">
          <DashboardCard icon={PieChart} title="Por categoría">
            {analytics.porCategoria.length > 0 ? (
              <ChartDonut
              data={analytics.porCategoria.map((c) => ({ name: c.nombre, value: c.ingresos }))}
              centerLabel="Categorías"
            />
            ) : (
              <EmptyChart />
            )}
          </DashboardCard>
        </div>

        <div className="lg:col-span-4">
          <DashboardCard icon={CreditCard} title="Método de pago">
            {analytics.porMetodoPago.length > 0 ? (
              <ChartDonut
              data={analytics.porMetodoPago.map((m) => ({ name: m.nombre, value: m.ingresos }))}
              centerLabel="Método"
            />
            ) : (
              <EmptyChart />
            )}
          </DashboardCard>
        </div>

        <div className="lg:col-span-8">
          <DashboardCard
            icon={ClipboardList}
            title="Últimas órdenes"
            right={
              <Link
                href="/admin/ordenes"
                className="text-xs font-medium text-[var(--admin-accent)] hover:underline"
              >
                Ver todas
              </Link>
            }
          >
            <div className="-m-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--admin-card-border)]">
                    <th className="px-6 py-3 text-left font-medium text-[var(--admin-text-muted)]">Pedido</th>
                    <th className="px-6 py-3 text-left font-medium text-[var(--admin-text-muted)]">Cliente</th>
                    <th className="px-6 py-3 text-left font-medium text-[var(--admin-text-muted)]">Items</th>
                    <th className="hidden px-6 py-3 text-left font-medium text-[var(--admin-text-muted)] md:table-cell">Método</th>
                    <th className="px-6 py-3 text-left font-medium text-[var(--admin-text-muted)]">Total</th>
                    <th className="px-6 py-3 text-left font-medium text-[var(--admin-text-muted)]">Estado</th>
                    <th className="px-6 py-3 text-left font-medium text-[var(--admin-text-muted)]">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.ultimasOrdenes.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-[var(--admin-text-dim)]">
                        No hay órdenes aún
                      </td>
                    </tr>
                  )}
                  {analytics.ultimasOrdenes.map((orden) => (
                    <tr
                      key={orden.numero_pedido}
                      className="border-b border-[var(--admin-card-border)] transition-colors hover:bg-[var(--admin-hover)]"
                    >
                      <td className="px-6 py-3">
                        <Link
                          href={`/admin/ordenes/${orden.numero_pedido}`}
                          className="font-mono font-medium text-[var(--admin-accent)] hover:underline"
                        >
                          {orden.numero_pedido}
                        </Link>
                      </td>
                      <td className="max-w-[160px] truncate px-6 py-3 text-[var(--admin-text)]">
                        {orden.nombre_entrega}
                      </td>
                      <td className="px-6 py-3 tabular-nums text-[var(--admin-text-muted)]">
                        {orden.items}
                      </td>
                      <td className="hidden px-6 py-3 md:table-cell">
                        {orden.metodo_pago === 'CONTRA_ENTREGA' ? (
                          <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                            COD
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--admin-text-muted)]">
                            {metodoPagoLabel(orden.metodo_pago)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 tabular-nums font-medium text-[var(--admin-text)]">
                        {formatearCOPCompleto(orden.total)}
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge status={orden.estado} />
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-[var(--admin-text-muted)]">
                        {new Date(orden.created_at).toLocaleDateString('es-CO', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-4">
          <DashboardCard icon={ClipboardList} title="Órdenes por estado">
            {analytics.ordenesPorEstado.length > 0 ? (
              <ChartEstados data={analytics.ordenesPorEstado} />
            ) : (
              <EmptyChart />
            )}
          </DashboardCard>

          <DashboardCard icon={Ticket} title="Cupones">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[var(--admin-text-muted)]">
                  Redenciones
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--admin-text)]">
                  {analytics.cuponesUsados}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[var(--admin-text-muted)]">
                  Descontado
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-400">
                  {formatearCOPCompleto(analytics.cuponesDescontado)}
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs text-[var(--admin-text-dim)]">
              Descuentos aplicados con cupón acorde a la política de la tienda.
            </p>
            <Link
              href="/admin/cupones"
              className="mt-4 inline-block text-xs font-medium text-[var(--admin-accent)] hover:underline"
            >
              Gestionar cupones →
            </Link>
          </DashboardCard>
        </div>

        {/* Boletería (T7) */}
        <div className="mb-8">
          <BoleteriaCard stats={boleteriaStats} />
        </div>
      </div>
    </>
  )
}
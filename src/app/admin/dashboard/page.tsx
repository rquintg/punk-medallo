import { DollarSign, ShoppingBag, Truck, AlertTriangle, Ship, ShieldCheck } from 'lucide-react'
import { getDashboardStats } from '@/features/admin/services/dashboard'
import AdminHeader from '@/components/admin/admin-header'
import StatCard from '@/components/admin/stat-card'
import StatusBadge from '@/components/admin/status-badge'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()

  const pctPoliticas = stats.totalPedidos > 0
    ? Math.round((stats.politicasAceptadas / stats.totalPedidos) * 100)
    : 0

  return (
    <>
      <AdminHeader
        title="Dashboard"
        description="Resumen general de la tienda"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          label="Ingresos hoy"
          value={stats.ingresosHoy}
          icon={DollarSign}
          color="green"
          money
        />
        <StatCard
          label="Órdenes hoy"
          value={stats.ordenesHoy}
          icon={ShoppingBag}
          color="blue"
        />
        <StatCard
          label="Por enviar"
          value={stats.porEnviar}
          icon={Truck}
          color="amber"
        />
        <StatCard
          label="Stock bajo"
          value={stats.stockBajo}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          label="Envío recaudado hoy"
          value={stats.envioHoy}
          icon={Ship}
          color="blue"
          money
        />
        <StatCard
          label="Políticas aceptadas"
          value={`${pctPoliticas}%`}
          icon={ShieldCheck}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[var(--admin-card)] border border-[var(--admin-card-border)] rounded-xl">
          <div className="px-6 py-4 border-b border-[var(--admin-card-border)]">
            <h2 className="text-lg font-semibold text-[var(--admin-text)]">Últimas órdenes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--admin-card-border)]">
                  <th className="text-left px-6 py-3 text-[var(--admin-text-muted)] font-medium">Pedido</th>
                  <th className="text-left px-6 py-3 text-[var(--admin-text-muted)] font-medium">Cliente</th>
                  <th className="text-left px-6 py-3 text-[var(--admin-text-muted)] font-medium">Total</th>
                  <th className="text-left px-6 py-3 text-[var(--admin-text-muted)] font-medium">Estado</th>
                  <th className="text-left px-6 py-3 text-[var(--admin-text-muted)] font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {stats.ultimasOrdenes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[var(--admin-text-dim)]">
                      No hay órdenes aún
                    </td>
                  </tr>
                )}
                {stats.ultimasOrdenes.map((orden) => (
                  <tr
                    key={orden.numero_pedido}
                    className="border-b border-[var(--admin-card-border)] hover:bg-[var(--admin-hover)] transition-colors"
                  >
                    <td className="px-6 py-3">
                      <Link
                        href={`/admin/ordenes/${orden.numero_pedido}`}
                        className="text-[var(--admin-accent)] hover:underline font-medium"
                      >
                        {orden.numero_pedido}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-[var(--admin-text)]">{orden.nombre_entrega}</td>
                    <td className="px-6 py-3 text-[var(--admin-text)]">
                      ${orden.total.toLocaleString('es-CO')}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={orden.estado} />
                    </td>
                    <td className="px-6 py-3 text-[var(--admin-text-muted)]">
                      {new Date(orden.created_at).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[var(--admin-card)] border border-[var(--admin-card-border)] rounded-xl">
          <div className="px-6 py-4 border-b border-[var(--admin-card-border)]">
            <h2 className="text-lg font-semibold text-[var(--admin-text)]">Órdenes por estado</h2>
          </div>
          <div className="p-6 space-y-3">
            {stats.ordenesPorEstado.length === 0 && (
              <p className="text-center text-[var(--admin-text-dim)]">Sin datos</p>
            )}
            {stats.ordenesPorEstado.map((item) => (
              <div key={item.estado} className="flex items-center justify-between">
                <StatusBadge status={item.estado} />
                <span className="text-[var(--admin-text)] font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

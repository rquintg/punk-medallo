'use client'

import Link from 'next/link'
import DataTable from '@/components/admin/data-table'
import type { Column } from '@/components/admin/data-table'
import StatusBadge from '@/components/admin/status-badge'
import type { OrdenRow } from '@/features/admin/services/ordenes'

interface Props {
  data: OrdenRow[]
  total: number
  page: number
}

const columns: Column<OrdenRow>[] = [
  {
    key: 'numero_pedido',
    header: 'Pedido',
    cell: (item) => (
      <Link
        href={`/admin/ordenes/${item.numero_pedido}`}
        className="text-[var(--admin-accent)] hover:underline font-medium"
      >
        {item.numero_pedido}
      </Link>
    ),
  },
  {
    key: 'cliente',
    header: 'Cliente',
    cell: (item) => (
      <span className="text-[var(--admin-text)]">
        {item.nombre_entrega}
      </span>
    ),
  },
  {
    key: 'total',
    header: 'Total',
    cell: (item) => (
      <span className="font-medium text-[var(--admin-text)]">
        ${item.total.toLocaleString('es-CO')}
      </span>
    ),
  },
  {
    key: 'estado',
    header: 'Estado',
    cell: (item) => (
      <div className="flex items-center gap-2">
        <StatusBadge status={item.estado} />
        {item.metodo_pago === 'CONTRA_ENTREGA' && (
          <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
            COD
          </span>
        )}
      </div>
    ),
  },
  {
    key: 'fecha',
    header: 'Fecha',
    cell: (item) => (
      <span className="text-[var(--admin-text-muted)]">
        {new Date(item.created_at).toLocaleDateString('es-CO', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}
      </span>
    ),
    hideOnMobile: true,
  },
]

export default function OrdenesTable({ data, total, page }: Props) {
  return (
    <DataTable
      columns={columns}
      data={data}
      total={total}
      page={page}
      pageSize={20}
      emptyMessage="No se encontraron órdenes"
    />
  )
}

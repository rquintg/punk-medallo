'use client'

import DataTable from '@/components/admin/data-table'
import type { Column } from '@/components/admin/data-table'
import type { CuponRow } from '@/features/admin/services/cupones'
import {
  estadoCupon,
  tipoCuponLabel,
} from '@/features/admin/services/cupones'
import AccionesCupon from './acciones-cupon'

interface Props {
  data: CuponRow[]
}

function formatoFecha(fecha: string | null): string {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const columns: Column<CuponRow>[] = [
  {
    key: 'codigo',
    header: 'Código',
    cell: (item) => (
      <span className="font-mono font-semibold text-[var(--admin-text)]">{item.codigo}</span>
    ),
  },
  {
    key: 'tipo',
    header: 'Tipo',
    cell: (item) => (
      <span className="rounded-md border border-[var(--admin-card-border)] px-2 py-0.5 text-xs text-[var(--admin-text-muted)]">
        {tipoCuponLabel(item.tipo)}
      </span>
    ),
  },
  {
    key: 'valor',
    header: 'Beneficio',
    cell: (item) => (
      <span className="text-[var(--admin-text)]">
        {item.tipo === 'porcentaje'
          ? `${item.valor}%${item.descuento_maximo ? ` (máx ${formatPrecio(item.descuento_maximo)})` : ''}`
          : formatPrecio(item.valor)}
      </span>
    ),
    hideOnMobile: true,
  },
  {
    key: 'validez',
    header: 'Vigencia',
    cell: (item) => (
      <span className="text-[var(--admin-text-muted)]">
        {formatoFecha(item.fecha_inicio)} → {formatoFecha(item.fecha_fin)}
      </span>
    ),
    hideOnMobile: true,
  },
  {
    key: 'usos',
    header: 'Usos',
    cell: (item) => (
      <span className="text-[var(--admin-text-muted)]">
        {item.usos}
        {item.max_usos ? ` / ${item.max_usos}` : ''}
      </span>
    ),
  },
  {
    key: 'estado',
    header: 'Estado',
    cell: (item) => {
      const estado = estadoCupon(item)
      const clase =
        estado === 'activo'
          ? 'text-emerald-400 border-emerald-700/50 bg-emerald-900/20'
          : estado === 'vencido'
            ? 'text-amber-400 border-amber-700/50 bg-amber-900/20'
            : 'text-[var(--admin-text-dim)] border-[var(--admin-card-border)] bg-[var(--admin-hover)]'
      const label =
        estado === 'activo' ? 'Activo' : estado === 'vencido' ? 'Vencido' : 'Inactivo'
      return (
        <span className={`inline-block rounded-md border px-2 py-0.5 text-xs font-medium ${clase}`}>
          {label}
        </span>
      )
    },
  },
  {
    key: 'minimo',
    header: 'Mínimo',
    cell: (item) =>
      item.monto_minimo > 0 ? (
        <span className="text-[var(--admin-text-muted)]">{formatPrecio(item.monto_minimo)}</span>
      ) : (
        <span className="text-[var(--admin-text-dim)]">—</span>
      ),
    hideOnMobile: true,
  },
  {
    key: 'acciones',
    header: '',
    cell: (item) => <AccionesCupon cupon={item} />,
    className: 'w-40 text-right',
  },
]

function formatPrecio(n: number): string {
  return `$${n.toLocaleString('es-CO')}`
}

export default function CuponesTable({ data }: Props) {
  return (
    <DataTable
      columns={columns}
      data={data}
      total={data.length}
      page={1}
      pageSize={100}
      emptyMessage="No hay cupones creados"
    />
  )
}
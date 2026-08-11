'use client'

import DataTable from '@/components/admin/data-table'
import type { Column } from '@/components/admin/data-table'
import StatusBadge from '@/components/admin/status-badge'
import { can } from '@/features/admin/utils/permissions'
import type { UsuarioRow } from '@/features/admin/services/usuarios'
import AccionesUsuario from './acciones-usuario'

interface Props {
  data: UsuarioRow[]
  total: number
  page: number
  currentRol: string
  userId?: string
}

const columns: Column<UsuarioRow>[] = [
  {
    key: 'nombre',
    header: 'Nombre',
    cell: (item) => (
      <div>
        <span className="text-[var(--admin-text)] font-medium">
          {item.nombre || '—'}
        </span>
        <p className="text-xs text-[var(--admin-text-dim)]">{item.email}</p>
      </div>
    ),
  },
  {
    key: 'rol',
    header: 'Rol',
    cell: (item) => <StatusBadge status={item.rol} />,
  },
  {
    key: 'fecha',
    header: 'Registro',
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

export default function UsuariosTable({ data, total, page, currentRol, userId }: Props) {
  const puedeGestionar = can(currentRol, 'manage_users')

  const allColumns: Column<UsuarioRow>[] = [
    ...columns,
    ...(puedeGestionar
      ? [
          {
            key: 'acciones' as const,
            header: '' as const,
            cell: (item: UsuarioRow) => (
              <AccionesUsuario
                usuario={item}
                isSelf={item.id === userId}
              />
            ),
            className: 'w-32 text-right',
          },
        ]
      : []),
  ]

  return (
    <DataTable
      columns={allColumns}
      data={data}
      total={total}
      page={page}
      pageSize={20}
      emptyMessage="No hay usuarios registrados"
    />
  )
}

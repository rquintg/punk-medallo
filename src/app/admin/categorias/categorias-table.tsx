'use client'

import DataTable from '@/components/admin/data-table'
import type { Column } from '@/components/admin/data-table'
import type { CategoriaRow } from '@/features/admin/services/categorias'
import AccionesCategoria from './acciones-categoria'

interface Props {
  data: CategoriaRow[]
}

const columns: Column<CategoriaRow>[] = [
  {
    key: 'nombre',
    header: 'Nombre',
    cell: (item) => <span className="font-medium text-[var(--admin-text)]">{item.nombre}</span>,
  },
  {
    key: 'slug',
    header: 'Slug',
    cell: (item) => <span className="text-[var(--admin-text-muted)]">{item.slug}</span>,
    hideOnMobile: true,
  },
  {
    key: 'acciones',
    header: '',
    cell: (item) => <AccionesCategoria categoria={item} />,
    className: 'w-40 text-right',
  },
]

export default function CategoriasTable({ data }: Props) {
  return (
    <DataTable
      columns={columns}
      data={data}
      total={data.length}
      page={1}
      pageSize={100}
      emptyMessage="No hay categorías"
    />
  )
}

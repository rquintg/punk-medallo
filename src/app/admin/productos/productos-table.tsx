'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ImageIcon, Pencil } from 'lucide-react'
import DataTable from '@/components/admin/data-table'
import type { Column } from '@/components/admin/data-table'
import StatusBadge from '@/components/admin/status-badge'
import type { ProductoRow } from '@/features/admin/services/productos'

interface Props {
  data: ProductoRow[]
  total: number
  page: number
}

const columns: Column<ProductoRow>[] = [
  {
    key: 'imagen',
    header: '',
    cell: (item) => {
      const firstImg = item.producto_imagenes?.[0]
      return (
        <div className="w-10 h-10 rounded-lg bg-[var(--admin-hover)] flex items-center justify-center overflow-hidden">
          {firstImg ? (
            <Image
              src={firstImg.url}
              alt={firstImg.alt}
              width={40}
              height={40}
              className="object-cover w-full h-full"
            />
          ) : (
            <ImageIcon size={16} className="text-[var(--admin-text-dim)]" />
          )}
        </div>
      )
    },
    className: 'w-12',
  },
  {
    key: 'nombre',
    header: 'Producto',
    cell: (item) => (
      <div>
        <Link
          href={`/admin/productos/${item.id}`}
          className="text-[var(--admin-accent)] hover:underline font-medium"
        >
          {item.nombre}
        </Link>
        {item.descripcion && (
          <p className="text-xs text-[var(--admin-text-dim)] mt-0.5 line-clamp-1">
            {item.descripcion}
          </p>
        )}
      </div>
    ),
  },
  {
    key: 'categoria',
    header: 'Categoría',
    cell: (item) => (
      <span className="text-[var(--admin-text-muted)]">{item.categorias?.nombre ?? '—'}</span>
    ),
    hideOnMobile: true,
  },
  {
    key: 'precio',
    header: 'Precio',
    cell: (item) => (
      <span className="font-medium text-[var(--admin-text)]">
        ${item.precio.toLocaleString('es-CO')}
      </span>
    ),
  },
  {
    key: 'stock',
    header: 'Stock',
    cell: (item) => (
      <span className={item.stock_efectivo < 10 ? 'text-red-400 font-medium' : 'text-[var(--admin-text)]'}>
        {item.stock_efectivo}
      </span>
    ),
  },
  {
    key: 'activo',
    header: 'Estado',
    cell: (item) => (
      <StatusBadge status={item.activo ? 'activo' : 'inactivo'} />
    ),
    hideOnMobile: true,
  },
  {
    key: 'acciones',
    header: '',
    cell: (item) => (
      <Link
        href={`/admin/productos/${item.id}`}
        className="inline-flex items-center gap-1 text-sm text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] transition-colors"
      >
        <Pencil size={14} />
        Editar
      </Link>
    ),
    className: 'w-20 text-right',
  },
]

export default function ProductosTable({ data, total, page }: Props) {
  return (
    <DataTable
      columns={columns}
      data={data}
      total={total}
      page={page}
      pageSize={20}
      emptyMessage="No se encontraron productos"
    />
  )
}

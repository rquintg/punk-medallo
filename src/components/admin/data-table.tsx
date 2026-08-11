'use client'

import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import Pagination from './pagination'

export interface Column<T> {
  key: string
  header: string
  cell: (item: T) => ReactNode
  className?: string
  hideOnMobile?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  total: number
  page: number
  pageSize?: number
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (item: T) => void
}

export default function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  total,
  page,
  pageSize = 20,
  loading,
  emptyMessage = 'No hay registros',
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="bg-[var(--admin-card)] border border-[var(--admin-card-border)] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--admin-card-border)] bg-[var(--admin-card)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`text-left px-6 py-3 text-[var(--admin-text-muted)] font-medium ${
                    col.hideOnMobile ? 'hidden md:table-cell' : ''
                  } ${col.className ?? ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12">
                  <div className="flex items-center justify-center text-[var(--admin-text-dim)]">
                    <Loader2 size={20} className="animate-spin mr-2" />
                    Cargando…
                  </div>
                </td>
              </tr>
            )}
            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-[var(--admin-text-dim)]">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {!loading &&
              data.map((item, index) => (
                <tr
                  key={item.id ?? index}
                  onClick={() => onRowClick?.(item)}
                  className={`border-b border-[var(--admin-card-border)] transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  } hover:bg-[var(--admin-hover)]`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-6 py-3 text-[var(--admin-text)] ${
                        col.hideOnMobile ? 'hidden md:table-cell' : ''
                      } ${col.className ?? ''}`}
                    >
                      {col.cell(item)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pageSize={pageSize} total={total} />
    </div>
  )
}

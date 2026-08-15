'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ImageIcon, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import DataTable from '@/components/admin/data-table'
import type { Column } from '@/components/admin/data-table'
import StatusBadge from '@/components/admin/status-badge'
import { confirmDialog } from '@/components/admin/confirm-dialog'
import { deleteProducto } from '@/features/admin/actions/productos'
import type { ProductoRow } from '@/features/admin/services/productos'

interface Props {
  data: ProductoRow[]
  total: number
  page: number
}

function createColumns(onDelete: (id: string) => void): Column<ProductoRow>[] {
  return [
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
        <div className="flex items-center gap-2">
          <span className="font-medium text-[var(--admin-text)]">
            ${item.precio.toLocaleString('es-CO')}
          </span>
          {item.descuento > 0 && (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              -{item.descuento}%
            </span>
          )}
        </div>
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
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/admin/productos/${item.id}`}
            className="inline-flex items-center gap-1 text-sm text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] transition-colors"
          >
            <Pencil size={14} />
            Editar
          </Link>
          <button
            onClick={() => onDelete(item.id)}
            className="text-[var(--admin-text-muted)] hover:text-red-400 transition-colors p-1"
            aria-label="Eliminar producto"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
      className: 'w-24 text-right',
    },
  ]
}

export default function ProductosTable({ data, total, page }: Props) {
  const router = useRouter()

  async function handleDelete(id: string) {
    const confirmed = await confirmDialog({
      message: '¿Eliminar este producto? Esta acción no se puede deshacer.',
    })
    if (!confirmed) return
    try {
      await deleteProducto(id)
      toast.success('Producto eliminado')
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al eliminar')
    }
  }

  const columns = createColumns(handleDelete)

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

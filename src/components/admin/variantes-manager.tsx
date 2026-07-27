'use client'

import { useOptimistic, useRef, startTransition, useState } from 'react'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { createVariante, updateVariante, deleteVariante } from '@/features/admin/actions/variantes'
import type { VarianteRow } from '@/features/admin/services/variantes'

interface Props {
  productoId: string
  initialVariants: VarianteRow[]
  coloresDisponibles: string[]
}

const TALLAS = ['S', 'M', 'L', 'XL']

type Action =
  | { type: 'add'; variant: VarianteRow }
  | { type: 'update'; id: string; data: Partial<VarianteRow> }
  | { type: 'delete'; id: string }

export default function VariantesManager({ productoId, initialVariants, coloresDisponibles }: Props) {
  const [optimisticVariants, dispatch] = useOptimistic(initialVariants, (state, action: Action) => {
    switch (action.type) {
      case 'add':
        return [...state, action.variant]
      case 'update':
        return state.map((v) =>
          v.id === action.id ? { ...v, ...action.data } : v,
        )
      case 'delete':
        return state.filter((v) => v.id !== action.id)
      default:
        return state
    }
  })

  const formRef = useRef<HTMLFormElement>(null)

  async function handleAdd(formData: FormData) {
    const tempId = `temp-${Date.now()}`
    const talla = (formData.get('talla') as string) || null
    const color = (formData.get('color') as string) || null
    const stock = Number(formData.get('stock')) || 0
    const sku = (formData.get('sku') as string) || null

    startTransition(() => {
      dispatch({
        type: 'add',
        variant: { id: tempId, producto_id: productoId, talla, color, stock, sku },
      })
    })

    formRef.current?.reset()

    try {
      await createVariante(productoId, formData)
    } catch (e) {
      startTransition(() => dispatch({ type: 'delete', id: tempId }))
      toast.error(e instanceof Error ? e.message : 'Error al crear variante')
    }
  }

  async function handleUpdate(id: string, formData: FormData) {
    const talla = (formData.get('talla') as string) || null
    const color = (formData.get('color') as string) || null
    const stock = Number(formData.get('stock')) || 0
    const sku = (formData.get('sku') as string) || null

    startTransition(() => {
      dispatch({ type: 'update', id, data: { talla, color, stock, sku } })
    })

    try {
      await updateVariante(id, formData)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al actualizar')
    }
  }

  async function handleDelete(id: string) {
    startTransition(() => dispatch({ type: 'delete', id }))
    try {
      await deleteVariante(id)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al eliminar')
    }
  }

  return (
    <div className="card-section">
      <h2 className="text-lg font-semibold text-[var(--admin-text)] mb-5">
        Variantes
        <span className="text-sm text-[var(--admin-text-dim)] font-normal ml-2">
          ({optimisticVariants.length})
        </span>
      </h2>

      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--admin-card-border)]">
              <th className="text-left px-3 py-2 text-[var(--admin-text-muted)] font-medium">Color</th>
              <th className="text-left px-3 py-2 text-[var(--admin-text-muted)] font-medium">Talla</th>
              <th className="text-left px-3 py-2 text-[var(--admin-text-muted)] font-medium">Stock</th>
              <th className="text-left px-3 py-2 text-[var(--admin-text-muted)] font-medium">SKU</th>
              <th className="w-16 px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {optimisticVariants.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-[var(--admin-text-dim)]">
                  Sin variantes — el stock se lee de <code className="text-xs">productos.stock</code>
                </td>
              </tr>
            )}
            {optimisticVariants.map((v) => (
              <VarianteRow
                key={v.id}
                variant={v}
                onSave={handleUpdate}
                onDelete={handleDelete}
                coloresDisponibles={coloresDisponibles}
              />
            ))}
          </tbody>
        </table>
      </div>

      <form ref={formRef} action={handleAdd} className="flex items-end gap-3 flex-wrap">
        <select name="color" className="input max-w-[140px]" defaultValue="">
          <option value="">Color</option>
          {coloresDisponibles.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select name="talla" className="input max-w-[100px]" defaultValue="">
          <option value="">Talla</option>
          {TALLAS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <input
          name="stock"
          type="number"
          min={0}
          placeholder="Stock"
          className="input max-w-[90px]"
        />
        <input
          name="sku"
          placeholder="SKU (opcional)"
          className="input max-w-[130px]"
        />
        <button type="submit" className="btn-primary text-sm py-2">
          <Plus size={14} />
          Agregar
        </button>
      </form>
    </div>
  )
}

function VarianteRow({
  variant,
  onSave,
  onDelete,
  coloresDisponibles,
}: {
  variant: VarianteRow
  onSave: (id: string, formData: FormData) => Promise<void>
  onDelete: (id: string) => Promise<void>
  coloresDisponibles: string[]
}) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  if (editing) {
    return (
      <tr className="border-b border-[var(--admin-card-border)]">
        <td className="px-3 py-1.5">
          <select
            name="color"
            defaultValue={variant.color ?? ''}
            className="input text-xs py-1.5 px-2"
          >
            <option value="">—</option>
            {coloresDisponibles.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </td>
        <td className="px-3 py-1.5">
          <select
            name="talla"
            defaultValue={variant.talla ?? ''}
            className="input text-xs py-1.5 px-2"
          >
            <option value="">—</option>
            {TALLAS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </td>
        <td className="px-3 py-1.5">
          <input
            name="stock"
            type="number"
            min={0}
            defaultValue={variant.stock}
            className="input text-xs py-1.5 px-2 w-20"
          />
        </td>
        <td className="px-3 py-1.5">
          <input
            name="sku"
            defaultValue={variant.sku ?? ''}
            className="input text-xs py-1.5 px-2 w-24"
          />
        </td>
        <td className="px-3 py-1.5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={async () => {
                setSaving(true)
                const form = formRef.current!
                await onSave(variant.id, new FormData(form))
                setSaving(false)
                setEditing(false)
              }}
              disabled={saving}
              className="text-xs text-[var(--admin-accent)] hover:underline"
            >
              {saving ? '…' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-xs text-[var(--admin-text-dim)] hover:underline"
            >
              Cancelar
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-[var(--admin-card-border)] hover:bg-[var(--admin-hover)] transition-colors">
      <td className="px-3 py-2 text-[var(--admin-text)]">{variant.color || '—'}</td>
      <td className="px-3 py-2 text-[var(--admin-text)]">{variant.talla || '—'}</td>
      <td className="px-3 py-2">
        <span className={variant.stock < 5 ? 'text-red-400 font-medium' : 'text-[var(--admin-text)]'}>
          {variant.stock}
        </span>
      </td>
      <td className="px-3 py-2 text-[var(--admin-text-muted)]">{variant.sku || '—'}</td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] transition-colors p-1"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(variant.id)}
            className="text-[var(--admin-text-muted)] hover:text-red-400 transition-colors p-1"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}

'use client'

import { useOptimistic, useRef, startTransition, useState } from 'react'
import { Boxes, Plus, Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { createVariante, updateVariante, deleteVariante, type VarianteInput } from '@/features/admin/actions/variantes'
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

function parseVariantInput(formData: FormData): VarianteInput {
  return {
    talla: (formData.get('talla') as string) || null,
    color: (formData.get('color') as string) || null,
    stock: Number(formData.get('stock')) || 0,
    sku: (formData.get('sku') as string) || null,
  }
}

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
  const stockTotal = optimisticVariants.reduce((s, v) => s + v.stock, 0)

  async function handleAdd(formData: FormData) {
    const tempId = `temp-${Date.now()}`
    const data = parseVariantInput(formData)

    startTransition(() => {
      dispatch({
        type: 'add',
        variant: { id: tempId, producto_id: productoId, ...data },
      })
    })

    formRef.current?.reset()

    try {
      await createVariante(productoId, data)
    } catch (e) {
      startTransition(() => dispatch({ type: 'delete', id: tempId }))
      toast.error(e instanceof Error ? e.message : 'Error al crear variante')
    }
  }

  async function handleUpdate(id: string, data: VarianteInput) {
    startTransition(() => {
      dispatch({ type: 'update', id, data })
    })

    try {
      await updateVariante(id, data)
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
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <h2 className="admin-section-title">
          Variantes
          <span className="rounded-full bg-[var(--admin-accent)]/20 px-2 py-0.5 text-[11px] font-bold text-[var(--admin-accent)]">
            {optimisticVariants.length}
          </span>
        </h2>
        {optimisticVariants.length > 0 && (
          <span className="text-xs text-[var(--admin-text-dim)]">
            Stock total: <span className="font-bold tabular-nums text-[var(--admin-text)]">{stockTotal}</span>
          </span>
        )}
      </div>

      <form ref={formRef} action={handleAdd} className="mb-5 grid grid-cols-2 gap-3 rounded-lg border border-[var(--admin-card-border)] bg-[var(--admin-input-bg)] p-4 sm:grid-cols-[1fr_1fr_90px_1fr_auto]">
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[var(--admin-text-dim)]">
            Color
          </label>
          <select name="color" className="input" defaultValue="">
            <option value="">Color</option>
            {coloresDisponibles.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[var(--admin-text-dim)]">
            Talla
          </label>
          <select name="talla" className="input" defaultValue="">
            <option value="">Talla</option>
            {TALLAS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[var(--admin-text-dim)]">
            Stock
          </label>
          <input name="stock" type="number" min={0} placeholder="0" className="input" />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[var(--admin-text-dim)]">
            SKU
          </label>
          <input name="sku" placeholder="Opcional" className="input" />
        </div>
        <div className="flex items-end">
          <button type="submit" className="btn-primary w-full whitespace-nowrap text-sm py-2.5">
            <Plus size={14} />
            Agregar
          </button>
        </div>
      </form>

      {optimisticVariants.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-[var(--admin-card-border)] py-10 text-center">
          <Boxes size={28} className="text-[var(--admin-text-dim)]" />
          <p className="text-sm text-[var(--admin-text-muted)]">Sin variantes todavía</p>
          <p className="text-xs text-[var(--admin-text-dim)]">
            El stock se lee de <code className="rounded bg-[var(--admin-hover)] px-1">productos.stock</code>. Agrega combinaciones talla/color arriba.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--admin-card-border)]">
                <th className="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-[var(--admin-text-dim)]">Color</th>
                <th className="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-[var(--admin-text-dim)]">Talla</th>
                <th className="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-[var(--admin-text-dim)]">Stock</th>
                <th className="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-[var(--admin-text-dim)]">SKU</th>
                <th className="w-16 px-3 py-2" />
              </tr>
            </thead>
            <tbody>
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
      )}
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
  onSave: (id: string, data: VarianteInput) => Promise<void>
  onDelete: (id: string) => Promise<void>
  coloresDisponibles: string[]
}) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<VarianteInput>({
    talla: variant.talla,
    color: variant.color,
    stock: variant.stock,
    sku: variant.sku,
  })

  if (editing) {
    return (
      <tr className="border-b border-[var(--admin-card-border)] bg-[var(--admin-hover)]/50">
        <td className="px-3 py-1.5">
          <select
            aria-label="Color de la variante"
            value={form.color ?? ''}
            onChange={(e) => setForm({ ...form, color: e.target.value || null })}
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
            aria-label="Talla de la variante"
            value={form.talla ?? ''}
            onChange={(e) => setForm({ ...form, talla: e.target.value || null })}
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
            aria-label="Stock de la variante"
            type="number"
            min={0}
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: Number(e.target.value) || 0 })}
            className="input text-xs py-1.5 px-2 w-20"
          />
        </td>
        <td className="px-3 py-1.5">
          <input
            aria-label="SKU de la variante"
            value={form.sku ?? ''}
            onChange={(e) => setForm({ ...form, sku: e.target.value || null })}
            className="input text-xs py-1.5 px-2 w-24"
          />
        </td>
        <td className="px-3 py-1.5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={async () => {
                setSaving(true)
                try {
                  await onSave(variant.id, form)
                } finally {
                  setSaving(false)
                  setEditing(false)
                }
              }}
              disabled={saving}
              className="text-xs font-medium text-[var(--admin-accent)] hover:underline"
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
        <span className={variant.stock < 5 ? 'text-red-400 font-medium tabular-nums' : 'text-[var(--admin-text)] tabular-nums'}>
          {variant.stock}
        </span>
      </td>
      <td className="px-3 py-2 text-[var(--admin-text-muted)]">{variant.sku || '—'}</td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label={`Editar variante ${variant.talla ?? 'sin talla'} ${variant.color ?? ''}`}
            className="text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] transition-colors p-1"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(variant.id)}
            aria-label={`Eliminar variante ${variant.talla ?? 'sin talla'} ${variant.color ?? ''}`}
            className="text-[var(--admin-text-muted)] hover:text-red-400 transition-colors p-1"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}
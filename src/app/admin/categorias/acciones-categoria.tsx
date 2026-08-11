'use client'

import { useState } from 'react'
import { Pencil, Trash2, Plus, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createCategoria, updateCategoria, deleteCategoria } from '@/features/admin/actions/categorias'
import { confirmDialog } from '@/components/admin/confirm-dialog'
import type { CategoriaRow } from '@/features/admin/services/categorias'

export function NuevaCategoriaForm() {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  async function action(formData: FormData) {
    setSaving(true)
    try {
      await createCategoria(formData)
      toast.success('Categoría creada')
      setOpen(false)
    } catch (e) {
      setSaving(false)
      toast.error(e instanceof Error ? e.message : 'Error al crear')
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary">
        <Plus size={16} />
        Nueva categoría
      </button>
    )
  }

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input
        name="nombre"
        placeholder="Nombre de la categoría"
        required
        className="input max-w-xs"
        autoFocus
      />
      <textarea
        name="descripcion"
        placeholder="Descripción (opcional)"
        rows={1}
        className="input max-w-xs"
      />
      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
        Crear
      </button>
      <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
        <X size={14} />
      </button>
    </form>
  )
}

export default function AccionesCategoria({ categoria }: { categoria: CategoriaRow }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  async function action(formData: FormData) {
    setSaving(true)
    try {
      await updateCategoria(categoria.id, formData)
      toast.success('Categoría actualizada')
      setEditing(false)
    } catch (e) {
      setSaving(false)
      toast.error(e instanceof Error ? e.message : 'Error al actualizar')
    }
  }

  async function handleDelete() {
    const confirmed = await confirmDialog({
      message: `¿Eliminar la categoría "${categoria.nombre}"?`,
    })
    if (!confirmed) return
    try {
      await deleteCategoria(categoria.id)
      toast.success('Categoría eliminada')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al eliminar')
    }
  }

  if (editing) {
    return (
      <form action={action} className="flex flex-wrap items-center gap-2 justify-end">
        <input
          name="nombre"
          defaultValue={categoria.nombre}
          required
          className="input text-xs py-1 px-2 max-w-[140px]"
          autoFocus
        />
        <textarea
          name="descripcion"
          defaultValue={categoria.descripcion ?? ''}
          placeholder="Descripción (opcional)"
          rows={1}
          className="input text-xs py-1 px-2 max-w-[200px]"
        />
        <button type="submit" disabled={saving} className="text-xs text-[var(--admin-accent)] hover:underline">
          {saving ? '…' : 'Guardar'}
        </button>
        <button type="button" onClick={() => setEditing(false)} className="text-xs text-[var(--admin-text-dim)] hover:underline">
          Cancelar
        </button>
      </form>
    )
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      <button
        onClick={() => setEditing(true)}
        className="inline-flex items-center gap-1 text-sm text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] transition-colors"
      >
        <Pencil size={14} />
      </button>
      <button
        onClick={handleDelete}
        className="inline-flex items-center gap-1 text-sm text-[var(--admin-text-muted)] hover:text-red-400 transition-colors"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}

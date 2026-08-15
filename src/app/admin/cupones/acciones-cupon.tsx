'use client'

import { useState } from 'react'
import { Pencil, Trash2, Plus, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createCupon, updateCupon, deleteCupon } from '@/features/admin/actions/cupones'
import { confirmDialog } from '@/components/admin/confirm-dialog'
import type { CuponRow } from '@/features/admin/services/cupones'
import type { TipoCupon } from '@/features/cupones/types'

const TIPOS: { value: TipoCupon; label: string; hint: string }[] = [
  { value: 'porcentaje', label: 'Porcentaje (%)', hint: 'Ej: 10 = 10% de descuento' },
  { value: 'fijo', label: 'Monto fijo ($)', hint: 'Descuenta un valor fijo en COP' },
  { value: 'envio', label: 'Envío gratis', hint: 'No cobra envío (el valor no aplica)' },
]

function fechaInput(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toISOString().slice(0, 10)
}

function CuponFormFields({ cupon }: { cupon?: CuponRow | null }) {
  const [tipo, setTipo] = useState<TipoCupon>(cupon?.tipo ?? 'porcentaje')

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          name="codigo"
          placeholder="CÓDIGO (ej: PUNK10)"
          defaultValue={cupon?.codigo ?? ''}
          required
          className="input max-w-[180px] font-mono uppercase"
          autoFocus={!cupon}
        />
        <select
          name="tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoCupon)}
          className="input max-w-[160px]"
        >
          {TIPOS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <input
          name="valor"
          type="number"
          min={0}
          step={tipo === 'porcentaje' ? 1 : 1000}
          placeholder={tipo === 'porcentaje' ? '%' : 'Valor $'}
          defaultValue={cupon?.valor ?? ''}
          required
          disabled={tipo === 'envio'}
          className="input max-w-[120px]"
        />
      </div>

      {tipo === 'porcentaje' && (
        <input
          name="descuento_maximo"
          type="number"
          min={0}
          step={1000}
          placeholder="Tope máximo $ (opcional)"
          defaultValue={cupon?.descuento_maximo ?? ''}
          className="input max-w-[220px]"
        />
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          name="monto_minimo"
          type="number"
          min={0}
          step={1000}
          placeholder="Pedido mínimo $ (opcional)"
          defaultValue={cupon?.monto_minimo ?? ''}
          className="input max-w-[220px]"
        />
        <input
          name="max_usos"
          type="number"
          min={1}
          placeholder="Cupo máximo (opcional)"
          defaultValue={cupon?.max_usos ?? ''}
          className="input max-w-[180px]"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          name="fecha_inicio"
          type="date"
          defaultValue={fechaInput(cupon?.fecha_inicio ?? null)}
          className="input max-w-[160px]"
        />
        <span className="text-xs text-[var(--admin-text-dim)]">a</span>
        <input
          name="fecha_fin"
          type="date"
          defaultValue={fechaInput(cupon?.fecha_fin ?? null)}
          className="input max-w-[160px]"
        />
        <label className="flex items-center gap-2 text-sm text-[var(--admin-text)]">
          <input
            type="checkbox"
            name="activo"
            defaultChecked={cupon?.activo ?? true}
            className="h-4 w-4 accent-[var(--admin-accent)]"
          />
          Activo
        </label>
      </div>

      <p className="text-xs text-[var(--admin-text-dim)]">
        {TIPOS.find((t) => t.value === tipo)?.hint} · 1 uso por correo ·
        aplica solo en el checkout.
      </p>
    </div>
  )
}

export function NuevaCuponForm() {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  async function action(formData: FormData) {
    setSaving(true)
    try {
      await createCupon(formData)
      toast.success('Cupón creado')
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
        Nuevo cupón
      </button>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-2 rounded-lg border border-[var(--admin-card-border)] bg-[var(--admin-card)] p-3">
      <CuponFormFields />
      <div className="flex items-center gap-2">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Crear cupón
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
          <X size={14} />
        </button>
      </div>
    </form>
  )
}

export default function AccionesCupon({ cupon }: { cupon: CuponRow }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  async function action(formData: FormData) {
    setSaving(true)
    try {
      await updateCupon(cupon.id, formData)
      toast.success('Cupón actualizado')
      setEditing(false)
    } catch (e) {
      setSaving(false)
      toast.error(e instanceof Error ? e.message : 'Error al actualizar')
    }
  }

  async function handleDelete() {
    const confirmed = await confirmDialog({
      message: `¿Eliminar el cupón "${cupon.codigo}"?`,
    })
    if (!confirmed) return
    try {
      await deleteCupon(cupon.id)
      toast.success('Cupón eliminado')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al eliminar')
    }
  }

  if (editing) {
    return (
      <form action={action} className="flex flex-col gap-2 rounded-lg border border-[var(--admin-card-border)] bg-[var(--admin-card)] p-3">
        <CuponFormFields cupon={cupon} />
        <div className="flex items-center gap-2">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Loader2 size={14} className="animate-spin" /> : 'Guardar'}
          </button>
          <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    )
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      <button
        onClick={() => setEditing(true)}
        className="inline-flex items-center gap-1 text-sm text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] transition-colors"
        aria-label={`Editar cupón ${cupon.codigo}`}
      >
        <Pencil size={14} />
      </button>
      <button
        onClick={handleDelete}
        className="inline-flex items-center gap-1 text-sm text-[var(--admin-text-muted)] hover:text-red-400 transition-colors"
        aria-label={`Eliminar cupón ${cupon.codigo}`}
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}
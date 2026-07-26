'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { actualizarRolUsuario, eliminarUsuario } from '@/features/admin/actions/usuarios'
import type { UsuarioRow } from '@/features/admin/services/usuarios'

interface Props {
  usuario: UsuarioRow
  isSelf: boolean
}

const ROLES = ['cliente', 'publicador', 'admin', 'super_admin']

export default function AccionesUsuario({ usuario, isSelf }: Props) {
  const [saving, setSaving] = useState(false)

  async function cambiarRol(e: React.ChangeEvent<HTMLSelectElement>) {
    setSaving(true)
    try {
      await actualizarRolUsuario(usuario.id, e.target.value)
      toast.success('Rol actualizado')
    } catch {
      toast.error('Error al actualizar rol')
    } finally {
      setSaving(false)
    }
  }

  async function eliminar() {
    if (!confirm(`¿Eliminar usuario ${usuario.email}?`)) return
    try {
      await eliminarUsuario(usuario.id)
      toast.success('Usuario eliminado')
    } catch {
      toast.error('Error al eliminar usuario')
    }
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      <select
        defaultValue={usuario.rol}
        onChange={cambiarRol}
        disabled={saving || isSelf}
        className="text-xs px-2 py-1 rounded border border-[var(--admin-card-border)] bg-[var(--admin-bg)] text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/50 disabled:opacity-50"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r.replace('_', ' ')}
          </option>
        ))}
      </select>
      {!isSelf && (
        <button
          onClick={eliminar}
          className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
        >
          Eliminar
        </button>
      )}
    </div>
  )
}

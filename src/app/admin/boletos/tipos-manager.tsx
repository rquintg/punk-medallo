'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil, Trash2, Plus, Ticket } from 'lucide-react'
import { confirmDialog } from '@/components/admin/confirm-dialog'
import Price from '@/components/tienda/price'
import {
  agregarTipoAction,
  actualizarTipoAction,
  eliminarTipoAction,
} from '@/features/boletas/actions'
import type { TipoBoleta } from '@/features/boletas/types'

/**
 * Manager inline de tipos de boleta (estilo variantes-manager):
 * tabla editable + form para agregar. Bloqueos de negocio en las actions.
 */
export default function TiposManager({
  eventoId,
  tipos,
}: {
  eventoId: string
  tipos: TipoBoleta[]
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [agregando, setAgregando] = useState(false)

  function run(fn: () => Promise<void>, msg: string) {
    start(async () => {
      try {
        await fn()
        toast.success(msg)
        router.refresh()
      } catch (e: any) {
        toast.error(e?.message ?? 'Error')
      }
    })
  }

  const totalVendidas = tipos.reduce((s, t) => s + (t.vendidas ?? 0), 0)
  const totalCupo = tipos.reduce((s, t) => s + t.cantidadTotal, 0)

  return (
    <div className="card-section space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="admin-section-title">Tipos de boleta</h3>
        <span className="rounded-full bg-[var(--admin-accent)]/20 px-2.5 py-0.5 text-xs font-bold text-[var(--admin-accent)]">
          {totalVendidas} / {totalCupo} vendidas
        </span>
      </div>

      {tipos.length === 0 && !agregando && (
        <p className="flex items-center gap-2 py-8 text-sm text-[var(--admin-text-muted)]">
          <Ticket size={18} />
          Sin tipos todavía — agrega al menos uno (ej: "General").
        </p>
      )}

      {tipos.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-[var(--admin-card-border)] text-left text-xs uppercase tracking-wider text-[var(--admin-text-dim)]">
                <th className="pb-2 pr-4">Nombre</th>
                <th className="pb-2 pr-4">Precio</th>
                <th className="pb-2 pr-4">Vendidas</th>
                <th className="pb-2 pr-4">Usadas</th>
                <th className="pb-2 pr-4">Cupo total</th>
                <th className="pb-2 pr-4">Disponibles</th>
                <th className="pb-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tipos.map((t) =>
                editandoId === t.id ? (
                  <FilaEdicion
                    key={`edit-${t.id}`}
                    tipo={t}
                    pending={pending}
                    onGuardar={(fd) => run(() => actualizarTipoAction(t.id, fd), 'Tipo actualizado')}
                    onCancelar={() => setEditandoId(null)}
                  />
                ) : (
                  <tr key={t.id} className="border-b border-[var(--admin-card-border)] last:border-0">
                    <td className="py-2.5 pr-4 font-medium text-[var(--admin-text)]">{t.nombre}</td>
                    <td className="py-2.5 pr-4"><Price amount={t.precio} /></td>
                    <td className="py-2.5 pr-4 text-[var(--admin-text-muted)]">{t.vendidas ?? 0}</td>
                    <td className="py-2.5 pr-4 text-[var(--admin-text-muted)]">{t.usadas ?? 0}</td>
                    <td className="py-2.5 pr-4 text-[var(--admin-text-muted)]">{t.cantidadTotal}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`font-semibold ${(t.disponibles ?? 0) === 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {t.disponibles ?? 0}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => setEditandoId(t.id)} disabled={pending}
                          className="text-[var(--admin-text-muted)] transition-colors hover:text-[var(--admin-text)] disabled:opacity-50"
                          aria-label={`Editar ${t.nombre}`}>
                          <Pencil size={15} />
                        </button>
                        {(t.vendidas ?? 0) === 0 && (
                          <button
                            type="button"
                            disabled={pending}
                            onClick={async () => {
                              const ok = await confirmDialog({
                                message: `Eliminar "${t.nombre}"? Esta acción no se puede deshacer.`,
                              })
                              if (!ok) return
                              run(() => eliminarTipoAction(t.id), 'Tipo eliminado')
                            }}
                            className="text-neutral-500 transition-colors hover:text-red-400 disabled:opacity-50"
                            aria-label={`Eliminar ${t.nombre}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}

      {!agregando ? (
        <button
          type="button"
          onClick={() => setAgregando(true)}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-md border border-dashed border-[var(--admin-card-border)] px-4 py-2 text-sm font-medium text-[var(--admin-text-muted)] transition-colors hover:border-[var(--admin-accent)] hover:text-[var(--admin-text)] disabled:opacity-50"
        >
          <Plus size={16} /> Agregar tipo de boleta
        </button>
      ) : (
        <FilaFormulario
          pending={pending}
          onGuardar={(fd) =>
            run(async () => {
              await agregarTipoAction(eventoId, fd)
              setAgregando(false)
            }, 'Tipo agregado')
          }
          onCancelar={() => setAgregando(false)}
        />
      )}
    </div>
  )
}

// ---------- Formularios ----------

const inputCls =
  'w-full rounded-md border border-[var(--admin-card-border)] bg-[var(--admin-input-bg)] px-2.5 py-1.5 text-sm text-[var(--admin-text)] outline-none focus:border-[var(--admin-accent)]'
const labelCls = 'mb-1 block text-[11px] uppercase tracking-wider text-[var(--admin-text-dim)]'

function CamposConLabels({ tipo }: { tipo?: TipoBoleta }) {
  return (
    <>
      <div>
        <label className={labelCls}>Nombre</label>
        <input name="nombre" required defaultValue={tipo?.nombre} placeholder="General" maxLength={40} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Precio (COP)</label>
        <input name="precio" type="number" min={1000} step={500} required defaultValue={tipo?.precio}
          placeholder="50000" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Cupo total</label>
        <input name="cantidadTotal" type="number" min={1} step={1} required defaultValue={tipo?.cantidadTotal}
          placeholder="100" className={inputCls} />
      </div>
    </>
  )
}

function Botones({
  pending,
  textoGuardar,
  onCancelar,
}: {
  pending: boolean
  textoGuardar: string
  onCancelar: () => void
}) {
  return (
    <div className="flex items-center gap-2 sm:pb-1">
      <button type="button" onClick={onCancelar} disabled={pending}
        className="rounded-md px-3 py-1.5 text-sm text-[var(--admin-text-muted)] transition-colors hover:text-[var(--admin-text)] disabled:opacity-50">
        Cancelar
      </button>
      <button type="submit" disabled={pending}
        className="rounded-md bg-[var(--admin-accent)] px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50">
        {pending ? 'Guardando...' : textoGuardar}
      </button>
    </div>
  )
}

function FilaEdicion({
  tipo,
  pending,
  onGuardar,
  onCancelar,
}: {
  tipo: TipoBoleta
  pending: boolean
  onGuardar: (fd: FormData) => void
  onCancelar: () => void
}) {
  return (
    <tr className="border-b border-[var(--admin-card-border)] last:border-0">
      <td colSpan={6} className="bg-[var(--admin-hover)]/40 py-3 pl-3 pr-3">
        <form action={(fd) => onGuardar(fd)} className="grid items-end gap-3 sm:grid-cols-[1fr_150px_110px_auto]">
          <CamposConLabels tipo={tipo} />
          <Botones pending={pending} textoGuardar="Guardar" onCancelar={onCancelar} />
        </form>
      </td>
    </tr>
  )
}

function FilaFormulario({
  pending,
  onGuardar,
  onCancelar,
}: {
  pending: boolean
  onGuardar: (fd: FormData) => void
  onCancelar: () => void
}) {
  return (
    <form action={(fd) => onGuardar(fd)} className="rounded-lg border border-[var(--admin-card-border)] p-4">
      <div className="grid items-end gap-3 sm:grid-cols-[1fr_150px_110px_auto]">
        <CamposConLabels />
        <Botones pending={pending} textoGuardar="Agregar" onCancelar={onCancelar} />
      </div>
    </form>
  )
}

'use client'

import { useTransition, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { ImageIcon } from 'lucide-react'
import { crearEventoAction, actualizarEventoAction, subirImagenEventoAction } from '@/features/boletas/actions'
import type { EventoBoleto } from '@/features/boletas/types'

/**
 * Form de datos básicos del evento (crear y editar).
 * La imagen se sube solo en modo edición (necesita evento_id).
 */
export default function EventoForm({ initial }: { initial?: EventoBoleto }) {
  const router = useRouter()
  const esEdicion = Boolean(initial)
  const [pending, start] = useTransition()
  const [subiendo, setSubiendo] = useState(false)
  const [imagenUrl, setImagenUrl] = useState(initial?.imagenUrl ?? '')
  const [titulo, setTitulo] = useState(initial?.titulo ?? '')
  const fileRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)

    if (esEdicion && initial) {
      start(async () => {
        try {
          await actualizarEventoAction(initial.id, fd)
          toast.success('Evento actualizado')
          router.refresh()
        } catch (err: any) {
          toast.error(err?.message ?? 'Error al guardar')
        }
      })
    } else {
      start(async () => {
        try {
          const { id } = await crearEventoAction(fd)
          toast.success('Evento creado — agrega los tipos de boleta')
          router.push(`/admin/boletos/${id}`)
        } catch (err: any) {
          toast.error(err?.message ?? 'Error al crear')
        }
      })
    }
  }

  async function handleUpload() {
    if (!initial) return
    const file = fileRef.current?.files?.[0]
    if (!file || file.size === 0) return toast.error('Selecciona una imagen primero')
    if (!file.type.startsWith('image/')) return toast.error('Solo imágenes')
    if (file.size > 10 * 1024 * 1024) return toast.error('Máximo 10 MB')

    setSubiendo(true)
    try {
      const fd = new FormData()
      fd.set('file', file)
      const { url } = await subirImagenEventoAction(initial.id, initial.slug, fd)
      setImagenUrl(url)
      toast.success('Imagen subida')
      if (fileRef.current) fileRef.current.value = ''
      router.refresh()
    } catch (e: any) {
      toast.error(e?.message ?? 'Error al subir')
    } finally {
      setSubiendo(false)
    }
  }

  const inputCls =
    'w-full rounded-md border border-[var(--admin-card-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-text)] outline-none focus:border-[var(--admin-accent)] disabled:opacity-50'
  const labelCls = 'label'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Datos básicos */}
      <div className="card-section space-y-5">
        <h3 className="admin-section-title">Información del evento</h3>

        <div>
          <label htmlFor="titulo" className={labelCls}>Título *</label>
          <input id="titulo" name="titulo" required defaultValue={initial?.titulo} onChange={(e) => setTitulo(e.target.value)}
            className={inputCls} placeholder="Ej: Rockaton 2026" />
          {titulo && (
            <p className="mt-1 font-mono text-xs text-[var(--admin-text-dim)]">slug: /boletas/{titulo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}</p>
          )}
        </div>

        <div>
          <label htmlFor="descripcion" className={labelCls}>Descripción</label>
          <textarea id="descripcion" name="descripcion" rows={3} defaultValue={initial?.descripcion ?? ''}
            className={`${inputCls} resize-y`} placeholder="Detalles del evento (opcional)" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="lugar" className={labelCls}>Lugar *</label>
            <input id="lugar" name="lugar" required defaultValue={initial?.lugar}
              className={inputCls} placeholder="Ej: Club Foo, Medellín" />
          </div>
          <div>
            <label htmlFor="fechaEvento" className={labelCls}>Fecha y hora *</label>
            <input id="fechaEvento" name="fechaEvento" type="datetime-local" required
              defaultValue={initial ? initial.fechaEvento.slice(0, 16) : ''} className={inputCls} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="horaPuertas" className={labelCls}>Hora de puertas</label>
            <input id="horaPuertas" name="horaPuertas" defaultValue={initial?.horaPuertas ?? ''}
              className={inputCls} placeholder="Ej: 7:00 PM (opcional)" />
          </div>
          <div>
            <label htmlFor="edadMinima" className={labelCls}>Edad mínima</label>
            <input id="edadMinima" name="edadMinima" type="number" min={0} max={21}
              defaultValue={initial?.edadMinima ?? ''} className={inputCls} placeholder="Opcional" />
          </div>
        </div>
      </div>

      {/* Imagen (solo edición) */}
      <div className="card-section space-y-4">
        <h3 className="admin-section-title">Portada</h3>
        {esEdicion ? (
          <>
            {imagenUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagenUrl} alt="Portada del evento" className="h-40 w-auto rounded-lg border border-[var(--admin-card-border)] object-cover" />
            )}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp"
                disabled={subiendo || pending || !puede()}
                className="block w-full text-sm text-[var(--admin-text-muted)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--admin-accent)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white disabled:opacity-50" />
              <button type="button" onClick={handleUpload} disabled={subiendo || pending}
                className="shrink-0 rounded-md border border-[var(--admin-card-border)] px-4 py-2 text-sm font-semibold text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-hover)] disabled:opacity-50">
                {subiendo ? 'Subiendo...' : 'Subir'}
              </button>
            </div>
            <span className="text-[11px] text-[var(--admin-text-dim)]">PNG, JPG o WebP. Max 10 MB. Ideal horizontal.</span>
          </>
        ) : (
          <p className="flex items-center gap-2 text-sm text-[var(--admin-text-muted)]">
            <ImageIcon size={16} />
            Guarda el evento primero para poder subir la portada.
          </p>
        )}
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending || subiendo}
          className="rounded-lg bg-[var(--admin-accent)] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50">
          {pending ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear evento'}
        </button>
        {esEdicion && (
          <Link href="/admin/boletos" className="text-sm text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]">
            Cancelar
          </Link>
        )}
      </div>
    </form>
  )
}

/* El form en modo nuevo no depende de permisos extra: la action ya valida. */
function puede(): boolean {
  return true
}

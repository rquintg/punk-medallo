'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Trash2, Upload, Loader2, X, ImageIcon, Star } from 'lucide-react'
import { toast } from 'sonner'
import { subirImagen, eliminarImagen, actualizarAltImagen, actualizarColorImagen } from '@/features/admin/actions/productos'
import { confirmDialog } from '@/components/admin/confirm-dialog'
import type { ProductoImagen } from '@/features/admin/services/productos'

interface Props {
  productoId: string
  slug: string
  imagenes: ProductoImagen[]
  coloresDisponibles: string[]
}

export default function ImagenesManager({ productoId, slug, imagenes, coloresDisponibles }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [newColor, setNewColor] = useState('')

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const file = (form.elements.namedItem('file') as HTMLInputElement)?.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar 5 MB')
      return
    }
    const fd = new FormData(form)
    setUploading(true)
    try {
      await subirImagen(productoId, slug, fd)
      toast.success('Imagen subida')
      form.reset()
      setNewColor('')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al subir')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(imagenId: string, url: string) {
    const confirmed = await confirmDialog({
      message: '¿Eliminar esta imagen? Esta acción no se puede deshacer.',
    })
    if (!confirmed) return
    try {
      await eliminarImagen(imagenId, url)
      toast.success('Imagen eliminada')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  async function handleAltChange(imagenId: string, alt: string) {
    try {
      await actualizarAltImagen(imagenId, alt)
      router.refresh()
    } catch {
      toast.error('Error al actualizar alt')
    }
  }

  async function handleColorChange(imagenId: string, color: string) {
    try {
      await actualizarColorImagen(imagenId, color || null)
      router.refresh()
    } catch {
      toast.error('Error al actualizar color')
    }
  }

  const sorted = [...imagenes].sort((a, b) => a.orden - b.orden)

  return (
    <div className="card-section">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="admin-section-title">
          Imágenes
          <span className="rounded-full bg-[var(--admin-accent)]/20 px-2 py-0.5 text-[11px] font-bold text-[var(--admin-accent)]">
            {sorted.length}
          </span>
        </h2>
        {sorted.length > 1 && (
          <span className="text-xs text-[var(--admin-text-dim)]">La primera se muestra en catálogo</span>
        )}
      </div>

      {sorted.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
          {sorted.map((img, i) => (
            <div key={img.id} className="relative group rounded-lg border border-[var(--admin-card-border)] bg-[var(--admin-card)] p-2">
              <div className="relative aspect-square rounded-md overflow-hidden bg-[var(--admin-hover)] mb-2">
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                {i === 0 && (
                  <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-amber-400 backdrop-blur">
                    <Star size={10} fill="currentColor" />
                    Primera
                  </span>
                )}
              </div>
              <input
                type="text"
                defaultValue={img.alt}
                onBlur={(e) => handleAltChange(img.id, e.target.value)}
                placeholder="Texto alternativo"
                className="w-full text-xs bg-transparent border border-transparent hover:border-[var(--admin-card-border)] rounded px-1 py-0.5 text-[var(--admin-text-dim)] focus:outline-none focus:border-[var(--admin-accent)] mb-1"
              />
              {img.color ? (
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs bg-[var(--admin-accent)]/20 text-[var(--admin-accent)] px-1.5 py-0.5 rounded">
                    {img.color}
                  </span>
                  <button
                    onClick={() => handleColorChange(img.id, '')}
                    className="text-xs text-[var(--admin-text-dim)] hover:text-red-400 flex items-center gap-0.5"
                    title="Quitar color"
                  >
                    <X size={12} />
                    Quitar
                  </button>
                </div>
              ) : (
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) handleColorChange(img.id, e.target.value)
                  }}
                  className="w-full text-xs bg-[var(--admin-hover)] border border-[var(--admin-card-border)] rounded px-1 py-0.5 text-[var(--admin-text)] mb-1"
                >
                  <option value="">Asignar color...</option>
                  {coloresDisponibles.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              )}
              <button
                onClick={() => handleDelete(img.id, img.url)}
                className="absolute top-3 right-3 bg-black/60 rounded-full p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                aria-label="Eliminar imagen"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleUpload} className="rounded-xl border border-dashed border-[var(--admin-card-border)] p-6 transition-colors hover:border-[var(--admin-accent)]/50">
        <div className="flex flex-col gap-5 sm:flex-row">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center self-start rounded-xl bg-[var(--admin-accent)]/15">
            <ImageIcon size={26} className="text-[var(--admin-accent)]" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[var(--admin-text-dim)]">
                Archivo
              </label>
              <input
                ref={fileRef}
                type="file"
                name="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                required
                className="input text-sm"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[var(--admin-text-dim)]">
                  Texto alternativo
                </label>
                <input type="text" name="alt" className="input text-sm" placeholder="Breve descripción" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[var(--admin-text-dim)]">
                  Color
                </label>
                <select name="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="input text-sm">
                  <option value="">Sin color (imagen por defecto)</option>
                  {coloresDisponibles.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-stretch justify-between gap-2 sm:items-end">
            <button type="submit" disabled={uploading} className="btn-primary whitespace-nowrap">
              {uploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Upload size={16} />
              )}
              {uploading ? 'Subiendo...' : 'Subir imagen'}
            </button>
            <p className="text-right text-[11px] text-[var(--admin-text-dim)] sm:text-xs">
              JPG, PNG, WEBP o AVIF · máx 5 MB
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}
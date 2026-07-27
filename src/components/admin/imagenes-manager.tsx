'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Trash2, Upload, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { subirImagen, eliminarImagen, actualizarAltImagen, actualizarColorImagen } from '@/features/admin/actions/productos'
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
    const confirmed = await new Promise<boolean>((resolve) => {
      toast.custom((t) => (
        <div className="bg-[var(--admin-card)] border border-[var(--admin-card-border)] rounded-xl p-4 shadow-xl">
          <p className="text-sm text-[var(--admin-text)] mb-4">¿Eliminar esta imagen?</p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { resolve(false); toast.dismiss(t) }}
              className="btn-secondary text-xs"
            >
              Cancelar
            </button>
            <button
              onClick={() => { resolve(true); toast.dismiss(t) }}
              className="btn-primary text-xs"
            >
              Eliminar
            </button>
          </div>
        </div>
      ), { duration: Infinity })
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
      <h2 className="text-lg font-semibold text-[var(--admin-text)] mb-4">
        Imágenes del producto
      </h2>

      {sorted.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
          {sorted.map((img) => (
            <div key={img.id} className="relative group rounded-lg border border-[var(--admin-card-border)] bg-[var(--admin-card)] p-2">
              <div className="relative aspect-square rounded-md overflow-hidden bg-[var(--admin-hover)] mb-2">
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
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

      <form onSubmit={handleUpload} className="border-2 border-dashed border-[var(--admin-card-border)] rounded-xl p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 space-y-3">
            <div>
              <label className="label">Archivo</label>
              <input
                ref={fileRef}
                type="file"
                name="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                required
                className="input text-sm"
              />
            </div>
            <div>
              <label className="label">Texto alternativo</label>
              <input type="text" name="alt" className="input text-sm" placeholder="Breve descripción" />
            </div>
            <div>
              <label className="label">Color</label>
              <select name="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="input text-sm">
                <option value="">Sin color (imagen por defecto)</option>
                {coloresDisponibles.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="btn-primary whitespace-nowrap"
          >
            {uploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Upload size={16} />
            )}
            {uploading ? 'Subiendo...' : 'Subir imagen'}
          </button>
        </div>
      </form>
    </div>
  )
}

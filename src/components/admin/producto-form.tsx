'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createProducto, updateProducto } from '@/features/admin/actions/productos'
import { precioConDescuento } from '@/lib/precio'
import ToggleSwitch from '@/components/admin/toggle-switch'
import type { CategoriaRow } from '@/features/admin/services/categorias'
import type { ProductoRow } from '@/features/admin/services/productos'

const GENEROS = ['hombre', 'mujer', 'unisex']

const cop = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

interface Props {
  categorias: CategoriaRow[]
  producto?: ProductoRow | null
  variantesCount?: number
}

export default function ProductoForm({ categorias, producto, variantesCount = 0 }: Props) {
  const router = useRouter()
  const isEdit = !!producto
  const [saving, setSaving] = useState(false)
  const [nombre, setNombre] = useState(producto?.nombre ?? '')
  const [slugField, setSlugField] = useState(producto?.slug ?? '')
  const [precioVal, setPrecioVal] = useState(producto?.precio ?? 0)
  const [descuentoVal, setDescuentoVal] = useState(producto?.descuento ?? 0)
  const [categoriaVal, setCategoriaVal] = useState(producto?.categoria_id ?? '')

  const efectivo = precioConDescuento(precioVal, descuentoVal)

  const slugPreview = useMemo(() => {
    if (slugField) return null
    if (!nombre.trim()) return null
    return nombre
      .toLowerCase()
      .replace(/[^a-z0-9áéíóúüñ]+/g, '-')
      .replace(/^-|-$/g, '')
  }, [nombre, slugField])

  async function action(formData: FormData) {
    setSaving(true)
    try {
      if (isEdit) {
        await updateProducto(producto!.id, formData)
        toast.success('Producto actualizado')
        router.refresh()
      } else {
        const id = await createProducto(formData)
        toast.success('Producto creado')
        router.push(`/admin/productos/${id}`)
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  function arrVal(key: keyof ProductoRow) {
    const val = producto?.[key]
    return Array.isArray(val) ? val.join(', ') : ''
  }

  const categoriaNombre = categorias.find((c) => c.id === categoriaVal)?.nombre

  return (
    <form id="producto-form" action={action} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div className="min-w-0 space-y-6">
        <Section title="Información básica">
          <InputField
            label="Nombre *"
            name="nombre"
            required
            defaultValue={producto?.nombre ?? ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)}
            className="text-base font-medium"
          />
          <InputField
            label={
              <>
                Slug <Hint>dejar vacío para autogenerar</Hint>
              </>
            }
            name="slug"
            defaultValue={producto?.slug ?? ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSlugField(e.target.value)}
          />
          {slugPreview && (
            <p className="text-xs text-[var(--admin-text-dim)] -mt-3">
              Slug autogenerado: <span className="text-[var(--admin-text-muted)] font-mono">{slugPreview}</span>
            </p>
          )}
          <InputField
            label="Descripción"
            name="descripcion"
            tag="textarea"
            rows={5}
            defaultValue={producto?.descripcion ?? ''}
          />
        </Section>

        <Section title="Precio y stock">
          <div className="grid grid-cols-3 gap-3">
            <PrecioBlock
              label="Precio base"
              name="precio"
              required
              defaultValue={producto?.precio ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrecioVal(Number(e.target.value) || 0)}
            />
            <PrecioBlock
              label="Descuento"
              hint="%"
              name="descuento"
              defaultValue={producto?.descuento ?? 0}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDescuentoVal(Math.min(100, Math.max(0, Number(e.target.value) || 0)))
              }
            />
            <PrecioBlock label="Stock" name="stock" required defaultValue={producto?.stock ?? ''} />
          </div>
          {precioVal > 0 && descuentoVal > 0 && (
            <div className="mt-3 flex flex-wrap items-baseline gap-x-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm">
              <span className="text-[var(--admin-text-muted)]">Queda en</span>
              <strong className="font-bold tabular-nums text-emerald-400">{cop.format(efectivo)}</strong>
              <span className="text-xs text-[var(--admin-text-dim)]">(−{descuentoVal}% de {cop.format(precioVal)})</span>
            </div>
          )}
        </Section>

        <Section title="Clasificación">
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Género"
              name="genero"
              defaultValue={producto?.genero ?? 'unisex'}
              options={GENEROS.map((g) => ({ value: g, label: g }))}
            />
            <SelectField
              label="Categoría"
              name="categoria_id"
              defaultValue={producto?.categoria_id ?? ''}
              options={categorias.map((c) => ({ value: c.id, label: c.nombre }))}
              placeholder="Sin categoría"
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategoriaVal(e.target.value)}
            />
          </div>

          <InputField
            label={
              <>
                Tallas disponibles <Hint>separadas por coma</Hint>
              </>
            }
            name="tallas_disponibles"
            defaultValue={arrVal('tallas_disponibles')}
            placeholder="XS, S, M, L, XL"
          />
          <InputField
            label={
              <>
                Colores disponibles <Hint>separados por coma</Hint>
              </>
            }
            name="colores_disponibles"
            defaultValue={arrVal('colores_disponibles')}
            placeholder="Negro, Blanco, Rojo"
          />
        </Section>
      </div>

      <aside className="min-w-0 space-y-6 lg:sticky lg:top-8">
        <Section title="Estado">
          <div className="space-y-4">
            <ToggleSwitch
              name="activo"
              label="Producto activo"
              description="Visible en la tienda"
              defaultChecked={producto?.activo ?? true}
            />
            <ToggleSwitch
              name="destacado"
              label="Destacado"
              description="Se muestra en la sección de destacados"
              defaultChecked={producto?.destacado ?? false}
            />
          </div>
        </Section>

        <Section title="Publicar">
          <div className="space-y-2.5">
            {isEdit && (
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${
                    producto!.activo
                      ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
                      : 'border-[var(--admin-card-border)] bg-[var(--admin-hover)] text-[var(--admin-text-dim)]'
                  }`}
                >
                  {producto!.activo ? 'Activo' : 'Inactivo'}
                </span>
                {isEdit && producto!.stock_efectivo <= 0 && (
                  <span className="rounded-full border border-red-500/30 bg-red-500/15 px-2.5 py-0.5 text-xs font-bold text-red-400">
                    Agotado
                  </span>
                )}
                {isEdit && producto!.stock_efectivo > 0 && producto!.stock_efectivo < 10 && (
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-400">
                    Stock bajo
                  </span>
                )}
              </div>
            )}

            <ResumenRow label="Precio">
              {precioVal > 0 ? (
                descuentoVal > 0 ? (
                  <>
                    <span className="text-[var(--admin-text-dim)] line-through">{cop.format(precioVal)}</span>{' '}
                    <span className="text-emerald-400">{cop.format(efectivo)}</span>
                  </>
                ) : (
                  cop.format(precioVal)
                )
              ) : (
                <span className="font-normal text-[var(--admin-text-dim)]">—</span>
              )}
            </ResumenRow>
            <ResumenRow label="Categoría">{categoriaNombre ?? <span className="font-normal text-[var(--admin-text-dim)]">—</span>}</ResumenRow>
            {isEdit && (
              <ResumenRow label="Stock efectivo">
                <span className={producto!.stock_efectivo < 10 ? 'text-red-400' : ''}>
                  {producto!.stock_efectivo}
                </span>
              </ResumenRow>
            )}
            {isEdit && variantesCount > 0 && <ResumenRow label="Variantes">{variantesCount}</ResumenRow>}

            <div className="space-y-2 border-t border-[var(--admin-card-border)] pt-4">
              <button type="submit" disabled={saving} className="btn-primary w-full justify-center">
                {saving && <Loader2 size={16} className="animate-spin" />}
                {isEdit ? 'Guardar cambios' : 'Crear producto'}
              </button>
              <button type="button" onClick={() => router.back()} className="btn-secondary w-full justify-center">
                Cancelar
              </button>
              {isEdit && (
                <a
                  href={`/tienda/${producto!.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-1.5 text-sm font-medium text-[var(--admin-accent)] hover:underline"
                >
                  <ExternalLink size={14} />
                  Ver en la tienda
                </a>
              )}
            </div>
          </div>
        </Section>
      </aside>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-section">
      <h2 className="admin-section-title mb-5">{title}</h2>
      <div className="space-y-5">{children}</div>
    </div>
  )
}

function Hint({ children }: { children: React.ReactNode }) {
  return <span className="text-[var(--admin-text-dim)] font-normal">({children})</span>
}

function ResumenRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-[var(--admin-text-dim)]">{label}</span>
      <span className="font-medium tabular-nums text-[var(--admin-text)]">{children}</span>
    </div>
  )
}

function InputField({
  label,
  tag = 'input',
  ...props
}: {
  label: React.ReactNode
  name: string
  tag?: 'input' | 'textarea'
} & Record<string, unknown>) {
  const Tag = tag
  return (
    <div>
      <label className="label">{label}</label>
      <Tag {...props} className={`input ${(props.className as string) ?? ''}`} />
    </div>
  )
}

function PrecioBlock({
  label,
  hint,
  ...props
}: {
  label: string
  hint?: string
  name: string
} & Record<string, unknown>) {
  return (
    <div className="rounded-lg border border-[var(--admin-card-border)] bg-[var(--admin-input-bg)] p-3">
      <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-[var(--admin-text-dim)]">
        {label}
        {hint && <span className="ml-1 font-normal normal-case tracking-normal">({hint})</span>}
      </label>
      <input
        type="number"
        {...props}
        className="w-full bg-transparent text-lg font-bold tabular-nums text-[var(--admin-text)] focus:outline-none"
      />
    </div>
  )
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
  placeholder,
  onChange,
}: {
  label: string
  name: string
  defaultValue?: string
  options: { value: string; label: string }[]
  placeholder?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <select name={name} defaultValue={defaultValue} onChange={onChange} className="input">
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createProducto, updateProducto } from '@/features/admin/actions/productos'
import type { CategoriaRow } from '@/features/admin/services/categorias'
import type { ProductoRow } from '@/features/admin/services/productos'

const GENEROS = ['hombre', 'mujer', 'unisex']

interface Props {
  categorias: CategoriaRow[]
  producto?: ProductoRow | null
}

export default function ProductoForm({ categorias, producto }: Props) {
  const router = useRouter()
  const isEdit = !!producto
  const [saving, setSaving] = useState(false)
  const [nombre, setNombre] = useState(producto?.nombre ?? '')
  const [slugField, setSlugField] = useState(producto?.slug ?? '')

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
        router.refresh()
        router.push(`/admin/productos/${id}`)
      }
    } catch (e) {
      setSaving(false)
      toast.error(e instanceof Error ? e.message : 'Error al guardar')
    }
  }

  function arrVal(key: keyof ProductoRow) {
    const val = producto?.[key]
    return Array.isArray(val) ? val.join(', ') : ''
  }

  return (
    <form action={action} className="space-y-6">
      <Section title="Información básica">
        <InputField
          label="Nombre *"
          name="nombre"
          required
          defaultValue={producto?.nombre ?? ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)}
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
          <p className="text-xs text-[var(--admin-text-dim)] mt-1">
            Slug autogenerado: <span className="text-[var(--admin-text-muted)] font-mono">{slugPreview}</span>
          </p>
        )}
        <InputField label="Descripción" name="descripcion" tag="textarea" rows={5} defaultValue={producto?.descripcion ?? ''} />
      </Section>

      <Section title="Precio y stock">
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Precio *"
            name="precio"
            type="number"
            min={0}
            step={100}
            required
            defaultValue={producto?.precio ?? ''}
          />
          <InputField
            label="Stock *"
            name="stock"
            type="number"
            min={0}
            required
            defaultValue={producto?.stock ?? ''}
          />
        </div>
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

      <Section title="Estado">
        <ToggleField
          name="destacado"
          label="Producto destacado"
          defaultChecked={producto?.destacado ?? false}
        />
        <ToggleField
          name="activo"
          label="Producto activo (visible en tienda)"
          defaultChecked={producto?.activo ?? true}
        />
      </Section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {isEdit ? 'Guardar cambios' : 'Crear producto'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-section">
      <h2 className="text-lg font-semibold text-[var(--admin-text)] mb-5">{title}</h2>
      <div className="space-y-5">{children}</div>
    </div>
  )
}

function Hint({ children }: { children: React.ReactNode }) {
  return <span className="text-[var(--admin-text-dim)] font-normal">({children})</span>
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
      <Tag
        {...props}
        className="input"
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
}: {
  label: string
  name: string
  defaultValue?: string
  options: { value: string; label: string }[]
  placeholder?: string
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <select name={name} defaultValue={defaultValue} className="input">
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

function ToggleField({
  name,
  label,
  defaultChecked,
}: {
  name: string
  label: string
  defaultChecked: boolean
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        value="true"
        className="w-4 h-4 rounded border-[var(--admin-card-border)] text-[var(--admin-accent)] focus:ring-[var(--admin-accent)]/50"
      />
      <span className="text-sm text-[var(--admin-text)]">{label}</span>
    </label>
  )
}

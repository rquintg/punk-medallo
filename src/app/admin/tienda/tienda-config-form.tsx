'use client'

import { useTransition, useState, useRef } from 'react'
import { toast } from 'sonner'
import { updateTiendaConfig, updateTiendaConfigValor, subirLogo, restaurarLogo } from '@/features/admin/actions/tienda-config'
import type { TiendaConfig } from '@/features/tienda/services/tienda-config'
import { LOGO_DEFAULT } from '@/features/tienda/services/tienda-config'
import { toEmbedUrl } from '@/lib/live-embed'

function Toggle({ checked, disabled, onChange }: { checked: boolean; disabled?: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input type="checkbox" defaultChecked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className="h-6 w-11 rounded-full bg-[var(--admin-hover)] peer-checked:bg-[var(--admin-accent)] transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-5 block peer-disabled:opacity-50" />
    </label>
  )
}

function NumberField({
  label,
  hint,
  value,
  min,
  max,
  step,
  disabled,
  onSave,
}: {
  label: string
  hint?: string
  value: number
  min: number
  max: number
  step?: number
  disabled?: boolean
  onSave: (v: string) => void
}) {
  const [val, setVal] = useState(String(value))
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-dim)]">{label}</label>
      <input
        type="number"
        value={val}
        min={min}
        max={max}
        step={step ?? 1}
        disabled={disabled}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => onSave(val)}
        onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget.blur(), onSave(val))}
        className="w-full rounded-md border border-[var(--admin-card-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-text)] outline-none focus:border-[var(--admin-accent)] disabled:opacity-50"
      />
      {hint && <span className="text-[11px] text-[var(--admin-text-dim)]">{hint}</span>}
    </div>
  )
}

export default function TiendaConfigForm({ initial, puedeEditar }: { initial: TiendaConfig; puedeEditar: boolean }) {
  const [pending, start] = useTransition()
  const [liveUrlDraft, setLiveUrlDraft] = useState(initial.liveUrl ?? '')
  const [liveTituloDraft, setLiveTituloDraft] = useState(initial.liveTitulo ?? '')

  function toggle(key: string, valor: boolean) {
    if (!puedeEditar) return toast.error('Solo super_admin puede editar')
    start(async () => {
      try {
        await updateTiendaConfig(key, valor)
        toast.success('Configuracion guardada')
      } catch (e: any) {
        toast.error(e?.message ?? 'Error al guardar')
      }
    })
  }

  function saveValor(key: string, v: string) {
    if (!puedeEditar) return toast.error('Solo super_admin puede editar')
    start(async () => {
      try {
        await updateTiendaConfigValor(key, v)
        toast.success('Configuracion guardada')
      } catch (e: any) {
        toast.error(e?.message ?? 'Error al guardar')
      }
    })
  }

  const fileRef = useRef<HTMLInputElement>(null)
  const logoActual = initial.logoUrl ?? LOGO_DEFAULT

  async function handleSubirLogo() {
    if (!puedeEditar) return toast.error('Solo super_admin puede editar')
    const file = fileRef.current?.files?.[0]
    if (!file || file.size === 0) return toast.error('Selecciona una imagen primero')
    if (!file.type.startsWith('image/')) return toast.error('Solo se permiten imagenes')
    if (file.size > 10 * 1024 * 1024) return toast.error('La imagen no puede superar 10 MB')
    start(async () => {
      try {
        const fd = new FormData()
        fd.set('file', file)
        await subirLogo(fd)
        toast.success('Logo actualizado')
        if (fileRef.current) fileRef.current.value = ''
      } catch (e: any) {
        toast.error(e?.message ?? 'Error al subir el logo')
      }
    })
  }

  function handleRestaurarLogo() {
    if (!puedeEditar) return toast.error('Solo super_admin puede editar')
    start(async () => {
      try {
        await restaurarLogo()
        toast.success('Logo restaurado al default')
        if (fileRef.current) fileRef.current.value = ''
      } catch (e: any) {
        toast.error(e?.message ?? 'Error al restaurar')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Visibilidad */}
      <div className="card-section space-y-5">
        <h3 className="admin-section-title">Visibilidad</h3>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-[var(--admin-text)]">Tienda</p>
            <p className="text-sm text-[var(--admin-text-muted)]">Muestra /tienda en navbar. Si está off, se ve “Tienda en mantenimiento”.</p>
          </div>
          <Toggle checked={initial.tiendaActiva} disabled={pending || !puedeEditar} onChange={(v) => toggle('tienda_activa', v)} />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-[var(--admin-text)]">Boletería</p>
            <p className="text-sm text-[var(--admin-text-muted)]">Muestra /boletas en navbar. Si está off, se ve “Boletería en mantenimiento”.</p>
          </div>
          <Toggle checked={initial.boleteriaActiva} disabled={pending || !puedeEditar} onChange={(v) => toggle('boleteria_activa', v)} />
        </div>
        <p className="text-[11px] text-[var(--admin-text-dim)]">Cuando está en mantenimiento, la API de checkout también responde 503 — nadie puede pagar por URL directa.</p>
      </div>

      {/* Marca */}
      <div className="card-section space-y-5">
        <h3 className="admin-section-title">Marca</h3>
        <p className="-mt-3 text-sm text-[var(--admin-text-muted)]">
          Logo visible en Inicio, Acerca de, Paginas amigas, al compartir en redes (og meta tags).
        </p>
        <div className="flex flex-wrap items-center gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoActual}
            alt="Logo actual"
            className="h-24 w-24 rounded-lg border border-[var(--admin-card-border)] bg-white object-contain p-2"
          />
          <div className="flex flex-col gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={pending || !puedeEditar}
              className="block w-full text-sm text-[var(--admin-text-muted)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--admin-accent)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:opacity-90 disabled:opacity-50"
            />
            <span className="text-[11px] text-[var(--admin-text-dim)]">
              PNG con fondo transparente, ideal horizontal ~2:1 (ej: 960x480). Max 10 MB. Se ajusta sin deformarse en todos los espacios.
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSubirLogo}
                disabled={pending || !puedeEditar}
                className="rounded-md bg-[var(--admin-accent)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending ? 'Subiendo...' : 'Subir logo'}
              </button>
              {initial.logoUrl && (
                <button
                  type="button"
                  onClick={handleRestaurarLogo}
                  disabled={pending || !puedeEditar}
                  className="rounded-md border border-[var(--admin-card-border)] px-4 py-2 text-sm font-semibold text-[var(--admin-text-muted)] transition-colors hover:bg-[var(--admin-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Restaurar default
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transmision en vivo */}
      <div className="card-section space-y-5">
        <h3 className="admin-section-title">Transmisión en vivo</h3>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-[var(--admin-text)]">Mostrar transmisión</p>
            <p className="text-sm text-[var(--admin-text-muted)]">
              Video embebido en el inicio + botón flotante en las demás páginas
            </p>
          </div>
          <Toggle checked={initial.mostrarLive} disabled={pending || !puedeEditar} onChange={(v) => toggle('mostrar_live', v)} />
        </div>
        {initial.mostrarLive && (
          <div className="flex items-center justify-between gap-4 rounded-lg border border-[var(--admin-card-border)] bg-[var(--admin-input-bg)] px-4 py-3">
            <div>
              <p className="font-medium text-[var(--admin-text)]">Ya pasó (revive)</p>
              <p className="text-sm text-[var(--admin-text-muted)]">
                Actívalo cuando termine el directo para mostrarlo como replay.
              </p>
            </div>
            <Toggle checked={initial.liveRevive} disabled={pending || !puedeEditar} onChange={(v) => toggle('live_revive', v)} />
          </div>
        )}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-dim)]">URL de la transmisión</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={liveUrlDraft}
              disabled={pending || !puedeEditar}
              onChange={(e) => setLiveUrlDraft(e.target.value)}
              placeholder="https://youtube.com/watch?v=... o link de Facebook"
              className="w-full rounded-md border border-[var(--admin-card-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-text)] outline-none focus:border-[var(--admin-accent)] disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => saveValor('live_url', liveUrlDraft)}
              disabled={pending || !puedeEditar}
              className="shrink-0 rounded-md bg-[var(--admin-accent)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Guardar URL
            </button>
          </div>
          <span className="text-[11px] text-[var(--admin-text-dim)]">
            Pega el link completo de YouTube o Facebook.
          </span>
          {toEmbedUrl(liveUrlDraft) && (
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
              ✓ Embed valido: {new URL(toEmbedUrl(liveUrlDraft)!).hostname}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-dim)]">Título de la transmisión</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={liveTituloDraft}
              disabled={pending || !puedeEditar}
              onChange={(e) => setLiveTituloDraft(e.target.value)}
              placeholder="Ej: Punk Medallo en vivo — sesión acústica"
              maxLength={120}
              className="w-full rounded-md border border-[var(--admin-card-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-text)] outline-none focus:border-[var(--admin-accent)] disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => saveValor('live_titulo', liveTituloDraft)}
              disabled={pending || !puedeEditar}
              className="shrink-0 rounded-md bg-[var(--admin-accent)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Guardar título
            </button>
          </div>
          <span className="text-[11px] text-[var(--admin-text-dim)]">Vacio = "En vivo ahora". Max 120 caracteres.</span>
        </div>
      </div>

      {/* Catalogo */}
      <div className="card-section space-y-5">
        <h3 className="admin-section-title">Catalogo</h3>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-[var(--admin-text)]">Ofertas</p>
            <p className="text-sm text-[var(--admin-text-muted)]">Grid en /tienda y categorias (la pagina /tienda/ofertas sigue viva)</p>
          </div>
          <Toggle checked={initial.mostrarOfertas} disabled={pending || !puedeEditar} onChange={(v) => toggle('mostrar_ofertas', v)} />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-[var(--admin-text)]">Lo mas pedido</p>
            <p className="text-sm text-[var(--admin-text-muted)]">Ranking {initial.masPedidosDias} dias (anonimos + registrados)</p>
          </div>
          <Toggle checked={initial.mostrarMasPedidos} disabled={pending || !puedeEditar} onChange={(v) => toggle('mostrar_mas_pedidos', v)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <NumberField label="Dias ranking" hint="7-90" value={initial.masPedidosDias} min={7} max={90} disabled={pending || !puedeEditar} onSave={(v) => saveValor('mas_pedidos_dias', v)} />
          <NumberField label="Limite mas pedidos" hint="1-12" value={initial.masPedidosLimit} min={1} max={12} disabled={pending || !puedeEditar} onSave={(v) => saveValor('mas_pedidos_limit', v)} />
          <NumberField label="Productos por pagina" hint="6-48" value={initial.pageSize} min={6} max={48} disabled={pending || !puedeEditar} onSave={(v) => saveValor('page_size', v)} />
        </div>
      </div>

      {/* Envio */}
      <div className="card-section space-y-5">
        <h3 className="admin-section-title">Envio</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField label="Envio gratis desde (COP)" hint="50k - 500k" value={initial.envioGratisUmbral} min={50000} max={500000} step={1000} disabled={pending || !puedeEditar} onSave={(v) => saveValor('envio_gratis_umbral', v)} />
          <NumberField label="Tarifa Antioquia (COP)" value={initial.envioTarifaAntioquia} min={0} max={50000} step={500} disabled={pending || !puedeEditar} onSave={(v) => saveValor('envio_tarifa_antioquia', v)} />
          <NumberField label="Tarifa Centro/Norte (COP)" value={initial.envioTarifaCentro} min={0} max={50000} step={500} disabled={pending || !puedeEditar} onSave={(v) => saveValor('envio_tarifa_centro', v)} />
          <NumberField label="Tarifa Resto (COP)" value={initial.envioTarifaResto} min={0} max={50000} step={500} disabled={pending || !puedeEditar} onSave={(v) => saveValor('envio_tarifa_resto', v)} />
        </div>
      </div>

      {/* Contra entrega */}
      <div className="card-section space-y-5">
        <h3 className="admin-section-title">Contra entrega</h3>
        <NumberField label="Recargo COD (COP)" hint="0 - 20k" value={initial.codRecargo} min={0} max={20000} step={500} disabled={pending || !puedeEditar} onSave={(v) => saveValor('cod_recargo', v)} />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-dim)]">Municipios habilitados (coma separada)</label>
          <input
            defaultValue={initial.codMunicipios.join(',')}
            disabled={pending || !puedeEditar}
            placeholder="medellin,bello,itagui,envigado,sabaneta"
            onBlur={(e) => saveValor('cod_municipios', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget.blur())}
            className="w-full rounded-md border border-[var(--admin-card-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-text)] outline-none focus:border-[var(--admin-accent)] disabled:opacity-50"
          />
          <span className="text-[11px] text-[var(--admin-text-dim)]">Solo Antioquia (05) + estas ciudades. Max 20, sin tildes.</span>
        </div>
      </div>

      {/* Stock */}
      <div className="card-section space-y-5">
        <h3 className="admin-section-title">Inventario</h3>
        <NumberField label="Stock bajo umbral" hint="1-50" value={initial.stockBajoUmbral} min={1} max={50} disabled={pending || !puedeEditar} onSave={(v) => saveValor('stock_bajo_umbral', v)} />
      </div>
    </div>
  )
}

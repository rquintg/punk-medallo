import { BellRing } from 'lucide-react'
import MarcarContactadoButton from '@/components/admin/marcar-contactado-button'
import { getSupabaseAdmin } from '@/features/admin/services/supabase-admin'

interface AvisoRow {
  id: string
  email: string
  telefono: string | null
  talla: string | null
  color: string | null
  created_at: string
  notificado_at: string | null
  contactado_at: string | null
}

interface AvisosManagerProps {
  productoId: string
}

const ORDER = { pendiente: 0, notificado: 1, contactado: 2 }

export async function AvisosManager({ productoId }: AvisosManagerProps) {
  const { data: avisos } = await (getSupabaseAdmin()
    .from('avisos_stock')
    .select('id, email, telefono, talla, color, created_at, notificado_at, contactado_at')
    .eq('producto_id', productoId)
    .order('created_at', { ascending: false })
    .limit(100) as any)

  const lista: AvisoRow[] = (avisos ?? []) as AvisoRow[]

  const estado = (a: AvisoRow): keyof typeof ORDER => (a.contactado_at ? 'contactado' : a.notificado_at ? 'notificado' : 'pendiente')

  const ordenados = [...lista].sort((a, b) => ORDER[estado(a)] - ORDER[estado(b)])
  const pendientes = lista.filter((a) => !a.notificado_at).length

  const ESTADOS_LABEL = {
    pendiente: 'Pendiente',
    notificado: 'Notificado',
    contactado: 'Contactado',
  } as const

  const ESTADOS_STYLE = {
    pendiente: 'border-red-500/30 bg-red-500/15 text-red-400',
    notificado: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400',
    contactado: 'border-[var(--admin-card-border)] bg-[var(--admin-hover)] text-[var(--admin-text-dim)]',
  } as const

  if (lista.length === 0) {
    return (
      <section className="card-section">
        <h2 className="admin-section-title mb-4">
          Avisos de stock
          <span className="rounded-full bg-[var(--admin-accent)]/20 px-2 py-0.5 text-[11px] font-bold text-[var(--admin-accent)]">
            0
          </span>
        </h2>
        <p className="text-sm text-[var(--admin-text-dim)]">
          Nadie esperando este producto. Cuando un cliente deja su email en un producto agotado, aparece acá y se le
          notifica al subir stock.
        </p>
      </section>
    )
  }

  return (
    <section className="card-section">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="admin-section-title">
          Avisos de stock
          <span className="rounded-full bg-[var(--admin-accent)]/20 px-2 py-0.5 text-[11px] font-bold text-[var(--admin-accent)]">
            {lista.length}
          </span>
        </h2>
        <BellRing size={16} className="text-[var(--admin-text-dim)]" />
      </div>
      <p className="mb-4 text-xs text-[var(--admin-text-dim)]">
        {pendientes} pendiente{pendientes !== 1 ? 's' : ''} · al subir stock se envía el email y el aviso pasa a
        "Notificado" (queda guardado para contacto manual por WhatsApp). Los teléfonos quedan disponibles siempre.
      </p>
      <ul className="space-y-2">
        {ordenados.map((a) => {
          const e = estado(a)
          return (
            <li
              key={a.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-[var(--admin-card-border)] bg-[var(--admin-input-bg)] px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-1.5 truncate text-xs font-medium text-[var(--admin-text)]">
                  {a.email}
                  <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-bold ${ESTADOS_STYLE[e]}`}>
                    {ESTADOS_LABEL[e]}
                  </span>
                  {a.talla && (
                    <span className="rounded bg-[var(--admin-accent)]/20 px-1.5 py-0.5 text-[10px] font-bold text-[var(--admin-accent)]">
                      {[a.color, a.talla].filter(Boolean).join(' / ')}
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--admin-text-dim)]">
                  {new Date(a.created_at).toLocaleDateString('es-CO', {
                    day: 'numeric',
                    month: 'short',
                  })}
                  {a.notificado_at &&
                    ` · email ${new Date(a.notificado_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}`}
                  {a.contactado_at &&
                    ` · Wsp ${new Date(a.contactado_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}`}
                  {a.telefono && ` · 📱 ${a.telefono}`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {!a.contactado_at && <MarcarContactadoButton avisoId={a.id} />}
                {a.telefono && (
                  <a
                    href={`https://wa.me/57${a.telefono.replace(/^\D?57/, '')}?text=${encodeURIComponent('Hola, te escribimos de Punk Medallo por el aviso de stock')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 transition-colors hover:bg-emerald-500/20"
                  >
                    WhatsApp
                  </a>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
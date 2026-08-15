import { BellRing } from 'lucide-react'
import { getSupabaseAdmin } from '@/features/admin/services/supabase-admin'

interface AvisoRow {
  id: string
  email: string
  telefono: string | null
  talla: string | null
  color: string | null
  created_at: string
}

interface AvisosManagerProps {
  productoId: string
}

export async function AvisosManager({ productoId }: AvisosManagerProps) {
  const { data: avisos } = await (getSupabaseAdmin()
    .from('avisos_stock')
    .select('id, email, telefono, talla, color, created_at')
    .eq('producto_id', productoId)
    .order('created_at', { ascending: false })
    .limit(50) as any)

  const lista: AvisoRow[] = (avisos ?? []) as AvisoRow[]

  if (lista.length === 0) {
    return (
      <section className="rounded-lg border border-neutral-800 bg-[#111] p-4">
        <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-white">
          <BellRing size={16} className="text-[#dc2626]" />
          Avisos de stock
        </h2>
        <p className="text-xs text-neutral-500">
          Nadie esperando este producto. Cuando un cliente deja su email en un producto agotado, aparece acá y se le notifica al subir stock.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-lg border border-neutral-800 bg-[#111] p-4">
      <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-white">
        <BellRing size={16} className="text-[#dc2626]" />
        Avisos de stock
        <span className="rounded-full bg-[#dc2626]/20 px-2 py-0.5 text-xs font-bold text-[#dc2626]">
          {lista.length}
        </span>
      </h2>
      <p className="mb-3 text-xs text-neutral-500">
        {lista.length} persona{lista.length !== 1 ? 's' : ''} esperando que vuelva el stock. Al subir stock se notifican automáticamente por email (por combinación talla/color si aplica); los teléfonos quedan disponibles para contacto manual.
      </p>
      <ul className="space-y-2">
        {lista.map((a) => (
          <li
            key={a.id}
            className="flex items-center justify-between gap-3 rounded-md border border-neutral-800 bg-[#181818] px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-white">
                {a.email}
                {a.talla && (
                  <span className="ml-1.5 rounded bg-[#dc2626]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#dc2626]">
                    {[a.color, a.talla].filter(Boolean).join(' / ')}
                  </span>
                )}
              </p>
              <p className="text-[11px] text-neutral-500">
                {new Date(a.created_at).toLocaleDateString('es-CO', {
                  day: 'numeric',
                  month: 'short',
                })}
                {a.telefono && ` · 📱 ${a.telefono}`}
              </p>
            </div>
            {a.telefono && (
              <a
                href={`https://wa.me/57${a.telefono.replace(/^\D?57/, '')}?text=${encodeURIComponent('Hola, te escribimos de Punk Medallo por el aviso de stock')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-md border border-emerald-800 bg-emerald-950/40 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 transition-colors hover:bg-emerald-900/40"
              >
                WhatsApp
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
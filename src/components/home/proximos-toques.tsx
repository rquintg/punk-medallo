import { CalendarDays } from 'lucide-react'
import ToqueCard from './toque-card'
import type { Evento } from '@/features/eventos/types'

export default function ProximosToques({ eventos }: { eventos: Evento[] }) {
  if (eventos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-800 bg-surface p-8 text-center">
        <CalendarDays size={28} className="mx-auto text-neutral-700" />
        <p className="mt-2 text-sm font-bold text-white">No hay toques anunciados</p>
        <p className="text-xs text-neutral-500">Síguenos en Instagram para enterarte primero.</p>
      </div>
    )
  }
  return (
    <div className="flex flex-wrap justify-center gap-5">
      {eventos.map((e, i) => (
        <ToqueCard key={`${e.id}-${i}`} evento={e} index={i} />
      ))}
    </div>
  )
}

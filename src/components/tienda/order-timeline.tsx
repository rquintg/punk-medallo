import { Check, Circle, Package, Truck, XCircle } from 'lucide-react'

export interface FechasPedido {
  aprobado?: string | null
  preparando?: string | null
  enviado?: string | null
  entregado?: string | null
}

interface OrderTimelineProps {
  estado: string
  fechas: FechasPedido
}

const PASOS: { key: keyof FechasPedido; label: string }[] = [
  { key: 'aprobado', label: 'Confirmado' },
  { key: 'preparando', label: 'En preparación' },
  { key: 'enviado', label: 'Enviado' },
  { key: 'entregado', label: 'Entregado' },
]

const TERMINALES_ERROR: Record<string, string> = {
  rechazado: 'Pago rechazado',
  anulado: 'Pedido anulado',
  error: 'Error en el pedido',
  cancelado: 'Pedido cancelado',
}

function formatFecha(iso?: string | null): string | null {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
  })
}

export default function OrderTimeline({ estado, fechas }: OrderTimelineProps) {
  const terminal = TERMINALES_ERROR[estado]

  if (terminal) {
    const ultimoPaso = PASOS.filter((p) => fechas[p.key]).length
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-md border border-red-900/60 bg-red-950/40 px-4 py-3">
          <XCircle size={20} className="shrink-0 text-red-500" />
          <p className="text-sm font-semibold text-red-400">{terminal}</p>
        </div>
        <ol className="space-y-0">
          {PASOS.map((paso, i) => {
            const done = i < ultimoPaso
            const fecha = formatFecha(fechas[paso.key])
            return (
              <li key={paso.key} className="relative flex gap-3 pb-5 last:pb-0">
                {i < PASOS.length - 1 && (
                  <span
                    className={`absolute left-[11px] top-6 h-full w-px ${done ? 'bg-[#dc2626]/60' : 'bg-neutral-800'}`}
                  />
                )}
                <span
                  className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                    done
                      ? 'border-[#dc2626] bg-[#dc2626] text-white'
                      : 'border-neutral-700 bg-[#181818] text-neutral-600'
                  }`}
                >
                  {done ? <Check size={13} /> : <Circle size={9} />}
                </span>
                <span className="pt-1">
                  <span className={`block text-sm font-medium ${done ? 'text-white' : 'text-neutral-500'}`}>
                    {paso.label}
                  </span>
                  {fecha && (
                    <span className="block text-xs text-neutral-500">{fecha}</span>
                  )}
                </span>
              </li>
            )
          })}
        </ol>
      </div>
    )
  }

  const pasosCompletados = PASOS.filter((p) => fechas[p.key]).length

  return (
    <ol className="space-y-0">
      {PASOS.map((paso, i) => {
        const done = i < pasosCompletados
        const actual = !done && i === pasosCompletados
        const fecha = formatFecha(fechas[paso.key])
        return (
          <li key={paso.key} className="relative flex gap-3 pb-5 last:pb-0">
            {i < PASOS.length - 1 && (
              <span
                className={`absolute left-[11px] top-6 h-full w-px ${done ? 'bg-[#dc2626]/60' : 'bg-neutral-800'}`}
              />
            )}
            <span
              className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                done
                  ? 'border-[#dc2626] bg-[#dc2626] text-white'
                  : actual
                    ? 'border-[#dc2626] bg-[#181818] text-[#dc2626]'
                    : 'border-neutral-700 bg-[#181818] text-neutral-600'
              }`}
            >
              {done ? <Check size={13} /> : actual ? <Truck size={12} /> : <Circle size={9} />}
            </span>
            <span className="pt-1">
              <span
                className={`block text-sm font-medium ${
                  done || actual ? 'text-white' : 'text-neutral-500'
                }`}
              >
                {paso.label}
              </span>
              {fecha && <span className="block text-xs text-neutral-500">{fecha}</span>}
            </span>
          </li>
        )
      })}
      {estado === 'pendiente' && (
        <li className="flex gap-3">
          <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neutral-700 bg-[#181818] text-neutral-600">
            <Circle size={9} />
          </span>
          <span className="pt-1 text-sm font-medium text-neutral-500">Pago pendiente</span>
        </li>
      )}
    </ol>
  )
}

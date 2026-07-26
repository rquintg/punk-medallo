interface StatusBadgeProps {
  status: string
}

const STATUS_STYLES: Record<string, string> = {
  pendiente: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  aprobado: 'bg-green-500/10 text-green-400 border-green-500/20',
  enviado: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  entregado: 'bg-green-500/10 text-green-400 border-green-500/20',
  cancelado: 'bg-red-500/10 text-red-400 border-red-500/20',
  rechazado: 'bg-red-500/10 text-red-400 border-red-500/20',
  anulado: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
  error: 'bg-red-500/10 text-red-400 border-red-500/20',
  activo: 'bg-green-500/10 text-green-400 border-green-500/20',
  inactivo: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20'

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}
    >
      {status}
    </span>
  )
}

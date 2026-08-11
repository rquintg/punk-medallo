const STATUS_STYLES: Record<string, string> = {
  // Estados de pedido
  pendiente: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  aprobado: 'bg-green-500/10 text-green-400 border-green-500/20',
  preparando: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  enviado: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  entregado: 'bg-green-500/10 text-green-400 border-green-500/20',
  pagado: 'bg-green-500/10 text-green-400 border-green-500/20',
  cancelado: 'bg-red-500/10 text-red-400 border-red-500/20',
  rechazado: 'bg-red-500/10 text-red-400 border-red-500/20',
  anulado: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
  error: 'bg-red-500/10 text-red-400 border-red-500/20',
  // Estado de producto
  activo: 'bg-green-500/10 text-green-400 border-green-500/20',
  inactivo: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
  // Roles de usuario
  super_admin: 'bg-red-600/10 text-red-400 border-red-600/20',
  admin: 'bg-blue-600/10 text-blue-400 border-blue-600/20',
  publicador: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  cliente: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
}

const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  aprobado: 'Aprobado',
  preparando: 'En preparación',
  enviado: 'Enviado',
  entregado: 'Entregado',
  pagado: 'Pagado',
  cancelado: 'Cancelado',
  rechazado: 'Rechazado',
  anulado: 'Anulado',
  error: 'Error',
  activo: 'Activo',
  inactivo: 'Inactivo',
  super_admin: 'Super Admin',
  admin: 'Admin',
  publicador: 'Publicador',
  cliente: 'Cliente',
}

interface StatusBadgeProps {
  status: string
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20'
  const label = STATUS_LABELS[status] ?? status

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}
    >
      {label}
    </span>
  )
}
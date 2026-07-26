import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color: 'red' | 'blue' | 'amber' | 'green'
}

const COLORS = {
  red: 'bg-red-500/10 text-red-400',
  blue: 'bg-blue-500/10 text-blue-400',
  amber: 'bg-amber-500/10 text-amber-400',
  green: 'bg-green-500/10 text-green-400',
}

export default function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-[var(--admin-card)] border border-[var(--admin-card-border)] rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--admin-text-muted)]">{label}</p>
          <p className="text-3xl font-bold text-[var(--admin-text)] mt-1">
            {typeof value === 'number' && label.toLowerCase().includes('ingreso')
              ? `$${value.toLocaleString('es-CO')}`
              : value}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${COLORS[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  )
}

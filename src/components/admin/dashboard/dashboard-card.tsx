import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import HelpTip from '../help-tip'

interface DashboardCardProps {
  icon: LucideIcon
  title: string
  help?: string
  right?: ReactNode
  children: ReactNode
  className?: string
}

export default function DashboardCard({ icon: Icon, title, help, right, children, className = '' }: DashboardCardProps) {
  return (
    <div className={`bg-[var(--admin-card)] border border-[var(--admin-card-border)] rounded-xl ${className}`}>
      <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-[var(--admin-card-border)]">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--admin-accent)]/10 text-[var(--admin-accent)]">
            <Icon size={16} />
          </span>
          <h2 className="admin-section-title">{title}</h2>
          {help && <HelpTip help={help} label={title} />}
        </div>
        {right}
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}
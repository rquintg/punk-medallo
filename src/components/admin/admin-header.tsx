import type { ReactNode } from 'react'

interface AdminHeaderProps {
  title: string
  description?: string
  children?: ReactNode
}

export default function AdminHeader({ title, description, children }: AdminHeaderProps) {
  return (
    <div className="mb-8 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-[var(--admin-text)]">{title}</h1>
        {description && (
          <p className="text-[var(--admin-text-muted)] mt-1">{description}</p>
        )}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  )
}

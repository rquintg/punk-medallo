import type { ReactNode } from 'react'

interface AdminHeaderProps {
  title: string
  description?: string
  children?: ReactNode
}

export default function AdminHeader({ title, description, children }: AdminHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <span className="hidden h-9 w-1.5 rounded-full bg-[var(--admin-accent)] sm:block" />
          <h1 className="text-2xl font-black uppercase tracking-wide text-[var(--admin-text)]">
            {title}
          </h1>
        </div>
        {description && (
          <p className="mt-1 text-sm text-[var(--admin-text-muted)]">{description}</p>
        )}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  )
}
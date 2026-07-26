'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'

interface PaginationProps {
  page: number
  pageSize: number
  total: number
}

export default function Pagination({ page, pageSize, total }: PaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  function goTo(p: number) {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(p))
    router.push(`${pathname}?${next.toString()}`)
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--admin-card-border)]">
      <p className="text-sm text-[var(--admin-text-muted)]">
        {total} {total === 1 ? 'resultado' : 'resultados'}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => goTo(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-md text-[var(--admin-text-muted)] hover:bg-[var(--admin-hover)] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
          .map((p, idx, arr) => (
            <span key={p} className="flex items-center">
              {idx > 0 && arr[idx - 1] !== p - 1 && (
                <span className="px-1 text-[var(--admin-text-dim)]">...</span>
              )}
              <button
                onClick={() => goTo(p)}
                className={`min-w-[32px] h-8 rounded-md text-sm font-medium transition-colors ${
                  p === page
                    ? 'bg-[var(--admin-accent)] text-white'
                    : 'text-[var(--admin-text-muted)] hover:bg-[var(--admin-hover)]'
                }`}
              >
                {p}
              </button>
            </span>
          ))}
        <button
          onClick={() => goTo(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-md text-[var(--admin-text-muted)] hover:bg-[var(--admin-hover)] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

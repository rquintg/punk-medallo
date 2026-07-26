'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useState } from 'react'

export default function SearchInput() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [value, setValue] = useState(searchParams.get('q') ?? '')

  function submit(term: string) {
    const next = new URLSearchParams(searchParams)
    if (term) {
      next.set('q', term)
    } else {
      next.delete('q')
    }
    next.delete('page')
    router.push(`${pathname}?${next.toString()}`)
  }

  return (
    <div className="relative mb-6">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-dim)]"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit(value)}
        placeholder="Buscar productos…"
        className="w-full max-w-md pl-9 pr-9 py-2 rounded-lg border border-[var(--admin-card-border)] bg-[var(--admin-card)] text-[var(--admin-text)] text-sm placeholder-[var(--admin-text-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/50"
      />
      {value && (
        <button
          onClick={() => {
            setValue('')
            submit('')
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-dim)] hover:text-[var(--admin-text)]"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}

'use client'

import { usePathname } from 'next/navigation'
import LiveFab from './LiveFab'

/** LiveFab oculto en /admin y en el inicio (el embed ya esta ahi). */
export function LiveFabConditional({ active }: { active: boolean }) {
  const pathname = usePathname()
  if (!active || pathname === '/' || pathname.startsWith('/admin')) return null
  return <LiveFab />
}

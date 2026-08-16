'use client'

import { useEffect, useState } from 'react'

export type AdminThemeMode = 'dark' | 'light' | 'system'
export type AdminThemeEfectivo = 'dark' | 'light'

export function resolverTemaAdmin(modo: AdminThemeMode): AdminThemeEfectivo {
  if (modo === 'system') {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  }
  return modo
}

export function temaAdminInicial(): AdminThemeEfectivo {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem('admin-theme') as AdminThemeMode | null
  return resolverTemaAdmin(stored ?? 'system')
}

export default function AdminTheme({ children }: { children: React.ReactNode }) {
  const [tema, setTema] = useState<AdminThemeEfectivo>(() => temaAdminInicial())

  useEffect(() => {
    const stored = localStorage.getItem('admin-theme') as AdminThemeMode | null
    if (stored) setTema(resolverTemaAdmin(stored))

    function syncTheme() {
      const t = localStorage.getItem('admin-theme') as AdminThemeMode | null
      setTema(resolverTemaAdmin(t ?? 'system'))
    }

    const mq = window.matchMedia('(prefers-color-scheme: light)')
    window.addEventListener('admin-theme-change', syncTheme)
    window.addEventListener('storage', syncTheme)
    mq.addEventListener('change', syncTheme)
    return () => {
      window.removeEventListener('admin-theme-change', syncTheme)
      window.removeEventListener('storage', syncTheme)
      mq.removeEventListener('change', syncTheme)
    }
  }, [])

  return (
    <div className={`admin-theme ${tema === 'light' ? 'light' : ''}`} data-theme={tema}>
      {children}
    </div>
  )
}
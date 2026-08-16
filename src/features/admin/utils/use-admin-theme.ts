'use client'

import { useEffect, useState } from 'react'

export type AdminThemeEfectivo = 'light' | 'dark'

export function useAdminTheme(): AdminThemeEfectivo {
  const [tema, setTema] = useState<AdminThemeEfectivo>('dark')

  useEffect(() => {
    function resolver(): AdminThemeEfectivo {
      const stored = localStorage.getItem('admin-theme')
      if (stored === 'system' || stored === null) {
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
      }
      return stored === 'light' ? 'light' : 'dark'
    }

    setTema(resolver())

    const handler = () => setTema(resolver())
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    window.addEventListener('admin-theme-change', handler)
    window.addEventListener('storage', handler)
    mq.addEventListener('change', handler)
    return () => {
      window.removeEventListener('admin-theme-change', handler)
      window.removeEventListener('storage', handler)
      mq.removeEventListener('change', handler)
    }
  }, [])

  return tema
}
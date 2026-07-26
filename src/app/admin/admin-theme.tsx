'use client'

import { useEffect, useState } from 'react'

export default function AdminTheme({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const stored = localStorage.getItem('admin-theme') as 'dark' | 'light' | null
    if (stored) setTheme(stored)

    function syncTheme() {
      const t = localStorage.getItem('admin-theme') as 'dark' | 'light' | null
      if (t) setTheme(t)
    }

    window.addEventListener('admin-theme-change', syncTheme)
    window.addEventListener('storage', syncTheme)
    return () => {
      window.removeEventListener('admin-theme-change', syncTheme)
      window.removeEventListener('storage', syncTheme)
    }
  }, [])

  return (
    <div className={`admin-theme ${theme === 'light' ? 'light' : ''}`}>
      {children}
    </div>
  )
}

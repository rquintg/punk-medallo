'use client'

import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { SidebarShell } from './sidebar-shell'

interface SidebarProps {
  rol: string
  userEmail: string
}

export default function Sidebar({ rol, userEmail }: SidebarProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <div className="hidden lg:block fixed top-0 left-0 z-40 h-screen w-64">
        <SidebarShell rol={rol} userEmail={userEmail} />
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        aria-expanded={open}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[var(--admin-card)] border border-[var(--admin-card-border)] text-[var(--admin-text)]"
      >
        <Menu size={20} />
      </button>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute top-0 left-0 h-full w-64 max-w-[85vw] shadow-2xl flex flex-col bg-[var(--admin-sidebar-bg)]">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
              className="absolute top-4 right-4 z-10 p-1.5 rounded-lg text-[var(--admin-text-muted)] hover:bg-[var(--admin-hover)]"
            >
              <X size={20} />
            </button>
            <SidebarShell rol={rol} userEmail={userEmail} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'

export type AdminThemeMode = 'dark' | 'light' | 'system'

const OPCIONES: { valor: AdminThemeMode; icono: typeof Sun; label: string }[] = [
  { valor: 'light', icono: Sun, label: 'Modo claro' },
  { valor: 'dark', icono: Moon, label: 'Modo oscuro' },
  { valor: 'system', icono: Monitor, label: 'Sistema' },
]

export default function ThemeToggle() {
  const [tema, setTema] = useState<AdminThemeMode>('dark')

  useEffect(() => {
    const stored = localStorage.getItem('admin-theme') as AdminThemeMode | null
    if (stored) setTema(stored)
  }, [])

  function seleccionar(modo: AdminThemeMode) {
    setTema(modo)
    localStorage.setItem('admin-theme', modo)
    window.dispatchEvent(new Event('admin-theme-change'))
  }

  return (
    <div
      role="group"
      aria-label="Tema del panel"
      className="grid grid-cols-3 gap-1 rounded-lg bg-[var(--admin-hover)]/60 p-1"
    >
      {OPCIONES.map((opcion) => {
        const activo = tema === opcion.valor
        const Icono = opcion.icono
        return (
          <button
            key={opcion.valor}
            type="button"
            onClick={() => seleccionar(opcion.valor)}
            aria-pressed={activo}
            title={opcion.label}
            className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
              activo
                ? 'bg-[var(--admin-accent)]/15 text-[var(--admin-accent)]'
                : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]'
            }`}
          >
            <Icono size={14} />
            <span className="hidden xl:inline">{opcion.label.replace('Modo ', '')}</span>
          </button>
        )
      })}
    </div>
  )
}
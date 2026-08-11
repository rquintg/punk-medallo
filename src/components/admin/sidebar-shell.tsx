'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Tags,
  Users,
  UserCircle,
  LogOut,
  Radio,
} from 'lucide-react'
import { can } from '@/features/admin/utils/permissions'
import ThemeToggle from './theme-toggle'

interface SidebarShellProps {
  rol: string
  userEmail: string
  onNavigate?: () => void
}

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    permission: 'view_dashboard' as const,
  },
  {
    label: 'Productos',
    href: '/admin/productos',
    icon: Package,
    permission: 'view_products' as const,
  },
  {
    label: 'Categorías',
    href: '/admin/categorias',
    icon: Tags,
    permission: 'edit_products' as const,
  },
  {
    label: 'Órdenes',
    href: '/admin/ordenes',
    icon: ClipboardList,
    permission: 'view_orders' as const,
  },
  {
    label: 'Usuarios',
    href: '/admin/usuarios',
    icon: Users,
    permission: 'view_users' as const,
  },
  {
    label: 'Perfil',
    href: '/admin/perfil',
    icon: UserCircle,
    permission: 'view_dashboard' as const,
  },
]

function isActive(href: string, pathname: string) {
  if (href === '/admin/dashboard') return pathname === href
  return pathname.startsWith(href)
}

export function SidebarShell({ rol, userEmail, onNavigate }: SidebarShellProps) {
  const pathname = usePathname()

  return (
    <aside className="flex h-full flex-col bg-[var(--admin-sidebar-bg)] border-r border-[var(--admin-sidebar-border)]">
      <div className="flex items-center gap-3 px-6 h-16 border-b border-[var(--admin-sidebar-border)] shrink-0">
        <Radio size={24} className="text-[var(--admin-accent)]" />
        <span className="font-bold text-[var(--admin-text)]">Punk Medallo</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          if (!can(rol, item.permission)) return null

          const active = isActive(item.href, pathname)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] border-l-2 border-[var(--admin-accent)]'
                  : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-hover)] border-l-2 border-transparent'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[var(--admin-sidebar-border)] space-y-2 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-[var(--admin-accent)]/20 flex items-center justify-center text-[var(--admin-accent)] text-sm font-bold">
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[var(--admin-text)] truncate">{userEmail}</p>
            <p className="text-xs text-[var(--admin-text-dim)] capitalize">
              {rol.replace('_', ' ')}
            </p>
          </div>
        </div>

        <ThemeToggle />

        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[var(--admin-text-muted)] hover:text-red-400 hover:bg-[var(--admin-hover)] transition-colors text-sm"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  )
}
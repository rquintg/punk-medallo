import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdminRol } from '@/features/admin/utils/permissions'
import { getRolActual } from '@/features/admin/utils/auth-server'
import Sidebar from '@/components/admin/sidebar'
import AdminTheme from './admin-theme'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/admin/dashboard')
  }

  const rol = await getRolActual()

  if (!isAdminRol(rol)) {
    redirect('/')
  }

  return (
    <AdminTheme>
      <Sidebar rol={rol} userEmail={user.email ?? ''} />
      <div className="lg:pl-64 min-h-screen bg-[var(--admin-bg)]">
        <main className="p-4 sm:p-8 mt-14 lg:mt-0">{children}</main>
      </div>
    </AdminTheme>
  )
}
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ADMIN_ROLES } from '@/features/admin/utils/permissions'
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

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  const rol = perfil?.rol ?? 'cliente'

  if (!ADMIN_ROLES.includes(rol as typeof ADMIN_ROLES[number])) {
    redirect('/')
  }

  return (
    <AdminTheme>
      <Sidebar rol={rol} userEmail={user.email ?? ''} />
      <div className="pl-64 min-h-screen bg-[var(--admin-bg)]">
        <main className="p-8">{children}</main>
      </div>
    </AdminTheme>
  )
}

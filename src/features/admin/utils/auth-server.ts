import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { can, ADMIN_ROLES, type AdminRol, type Permission } from './permissions'

export async function getUsuarioActual(): Promise<{ id: string; email: string | null } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return { id: user.id, email: user.email ?? null }
}

export async function getRolActual(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'cliente'

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  return perfil?.rol ?? 'cliente'
}

/** Redirige al dashboard si el rol no tiene el permiso. Usar en Server Components/páginas. */
export async function requirePermission(permission: Permission): Promise<AdminRol> {
  const rol = await getRolActual()
  if (!ADMIN_ROLES.includes(rol as AdminRol) || !can(rol, permission)) {
    redirect('/admin/dashboard')
  }
  return rol as AdminRol
}

/** Lanza error si el rol no tiene el permiso. Usar en Server Actions. */
export async function requirePermissionAction(permission: Permission): Promise<AdminRol> {
  const rol = await getRolActual()
  if (!ADMIN_ROLES.includes(rol as AdminRol) || !can(rol, permission)) {
    throw new Error('No tienes permisos para realizar esta acción')
  }
  return rol as AdminRol
}
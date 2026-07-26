import { redirect } from 'next/navigation'
import { Camera } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import AdminHeader from '@/components/admin/admin-header'
import { actualizarPerfil } from '@/features/admin/actions/perfil'

export default async function AdminPerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/admin/perfil')

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('nombre, avatar_url, rol')
    .eq('id', user.id)
    .single()

  return (
    <>
      <AdminHeader
        title="Mi perfil"
        description="Actualiza tu información personal"
      />

      <div className="max-w-2xl">
        <form
          action={actualizarPerfil}
          className="bg-[var(--admin-card)] border border-[var(--admin-card-border)] rounded-xl p-6 space-y-6"
        >
          <div className="flex items-center gap-6">
            <div className="relative">
              {perfil?.avatar_url ? (
                <img
                  src={perfil.avatar_url}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[var(--admin-accent)]/20 flex items-center justify-center text-[var(--admin-accent)] text-2xl font-bold">
                  {(perfil?.nombre?.[0] ?? user.email?.[0] ?? '?').toUpperCase()}
                </div>
              )}
              <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[var(--admin-accent)] text-white flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
                <Camera size={12} />
                <input
                  name="imagen"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <p className="text-[var(--admin-text)] font-medium">{user.email}</p>
              <p className="text-sm text-[var(--admin-text-muted)] capitalize">
                Rol: {perfil?.rol?.replace('_', ' ') ?? 'cliente'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--admin-text)] mb-1">Nombre</label>
            <input
              name="nombre"
              defaultValue={perfil?.nombre ?? ''}
              className="w-full px-3 py-2 rounded-lg border border-[var(--admin-card-border)] bg-[var(--admin-bg)] text-[var(--admin-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/50"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-[var(--admin-accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Guardar cambios
          </button>
        </form>
      </div>
    </>
  )
}

import AdminHeader from '@/components/admin/admin-header'
import { getUsuarios } from '@/features/admin/services/usuarios'
import { createClient } from '@/lib/supabase/server'
import UsuariosTable from './usuarios-table'

interface Props {
  searchParams: Promise<{ page?: string }>
}

const PAGE_SIZE = 20

export default async function AdminUsuariosPage({ searchParams }: Props) {
  const { page: pageStr } = await searchParams
  const page = Math.max(1, Number(pageStr) || 1)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user?.id)
    .single()

  const currentRol = (perfil?.rol as string) ?? 'cliente'

  const { data, total } = await getUsuarios(page, PAGE_SIZE)

  return (
    <>
      <AdminHeader
        title="Usuarios"
        description="Gestiona los usuarios y sus roles"
      />

      <UsuariosTable
        data={data}
        total={total}
        page={page}
        currentRol={currentRol}
        userId={user?.id}
      />
    </>
  )
}

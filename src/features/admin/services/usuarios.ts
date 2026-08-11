import { getSupabaseAdmin } from './supabase-admin'

export interface UsuarioRow {
  id: string
  email: string
  rol: string
  nombre: string | null
  created_at: string
}

export interface UsuariosResponse {
  data: UsuarioRow[]
  total: number
}

export async function getUsuarios(page: number, pageSize = 20): Promise<UsuariosResponse> {
  const supabase = getSupabaseAdmin()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data: perfiles, count, error } = await (supabase.from('perfiles') as any)
    .select('*', { count: 'exact' })
    .order('id', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('getUsuarios perfiles error:', error)
    throw new Error(error.message)
  }

  const rows = (perfiles ?? []) as UsuarioRow[]

  const { data: authUsers } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 10000,
  })

  const emailMap = new Map<string, string>()
  const createdMap = new Map<string, string>()
  for (const u of authUsers?.users ?? []) {
    emailMap.set(u.id, u.email ?? '')
    createdMap.set(u.id, u.created_at)
  }

  return {
    data: rows
      .map((r) => ({
        ...r,
        email: emailMap.get(r.id) ?? '',
        created_at: createdMap.get(r.id) ?? r.created_at ?? '',
      }))
      .sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    total: count ?? 0,
  }
}

export async function getUsuarioById(id: string): Promise<UsuarioRow | null> {
  const supabase = getSupabaseAdmin()

  const { data: perfil, error } = await (supabase.from('perfiles') as any)
    .select('*')
    .eq('id', id)
    .single()

  if (error || !perfil) return null

  const { data: authUser } = await supabase.auth.admin.getUserById(id)

  return {
    ...(perfil as UsuarioRow),
    email: authUser?.user?.email ?? '',
    created_at: authUser?.user?.created_at ?? '',
  }
}

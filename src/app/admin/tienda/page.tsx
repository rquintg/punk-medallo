import { getRolActual } from '@/features/admin/utils/auth-server'
import { can } from '@/features/admin/utils/permissions'
import { getTiendaConfig } from '@/features/tienda/services/tienda-config'
import TiendaConfigForm from './tienda-config-form'
import AdminHeader from '@/components/admin/admin-header'

export default async function AdminTiendaPage() {
  const rol = await getRolActual()
  if (!can(rol, 'view_analytics')) {
    const { redirect } = await import('next/navigation')
    redirect('/admin/dashboard')
  }
  const config = await getTiendaConfig()

  const puedeEditar = can(rol, 'manage_tienda_config')
  return (
    <div className="space-y-6">
      <AdminHeader title="Tienda" description="Secciones visibles en el catalogo (solo ocultan el grid, los filtros y paginas siguen funcionando)" />
      {!puedeEditar && <p className="text-sm text-amber-400">Solo super_admin puede editar esta configuracion. Ves los valores en solo lectura.</p>}
      <TiendaConfigForm initial={config} puedeEditar={puedeEditar} />
    </div>
  )
}

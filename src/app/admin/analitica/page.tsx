import { unstable_cache } from 'next/cache'
import {
  getAnalitica,
} from '@/features/admin/services/analitica'
import { requirePermission } from '@/features/admin/utils/auth-server'
import { RANGOS, type RangoDias } from '@/features/admin/services/dashboard'
import AdminHeader from '@/components/admin/admin-header'
import RangoSelector from '@/components/admin/dashboard/rango-selector'
import AnaliticaContent from './analitica-content'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const ETIQUETA_RANGO: Record<RangoDias, string> = { 7: '7 días', 30: '30 días', 90: '90 días' }

export default async function AdminAnaliticaPage({ searchParams }: PageProps) {
  await requirePermission('view_analytics')

  const params = await searchParams
  const rangoParam = Number(params.rango)
  const rango: RangoDias = (RANGOS as number[]).includes(rangoParam) ? (rangoParam as RangoDias) : 30

  const getCached = unstable_cache(
    async () => getAnalitica(rango),
    ['admin-analitica', String(rango)],
    { revalidate: 300 },
  )
  const reportes = await getCached()

  return (
    <>
      <AdminHeader
        title="Analítica"
        description={`Tráfico del sitio · últimos ${ETIQUETA_RANGO[rango]}`}
      >
        <RangoSelector base="/admin/analitica" />
      </AdminHeader>
      <AnaliticaContent reportes={reportes} rango={rango} />
    </>
  )
}
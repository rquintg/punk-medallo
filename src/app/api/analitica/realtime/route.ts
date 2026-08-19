import { NextResponse } from 'next/server'
import { getRealtime, analiticaConfigurada } from '@/features/admin/services/analitica'
import { getRolActual } from '@/features/admin/utils/auth-server'
import { can } from '@/features/admin/utils/permissions'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!analiticaConfigurada()) {
    return NextResponse.json({ error: 'GA4 no configurado' }, { status: 503 })
  }
  const rol = await getRolActual()
  if (!can(rol, 'view_analytics')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  try {
    const data = await getRealtime()
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    )
  }
}

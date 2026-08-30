import { NextResponse } from 'next/server'
import { getTiendaConfig } from '@/features/tienda/services/tienda-config'

export const dynamic = 'force-dynamic'

export async function GET() {
  const config = await getTiendaConfig()

  // Solo expone lo necesario para checkout cliente (envio + COD + visibilidad)
  const publicConfig = {
    envioGratisUmbral: config.envioGratisUmbral,
    envioTarifaAntioquia: config.envioTarifaAntioquia,
    envioTarifaCentro: config.envioTarifaCentro,
    envioTarifaResto: config.envioTarifaResto,
    codRecargo: config.codRecargo,
    codMunicipios: config.codMunicipios,
    tiendaActiva: config.tiendaActiva,
    boleteriaActiva: config.boleteriaActiva,
  }

  return NextResponse.json(publicConfig, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  })
}

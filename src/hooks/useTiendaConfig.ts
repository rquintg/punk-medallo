'use client'

import { useEffect, useState } from 'react'

interface PublicTiendaConfig {
  envioGratisUmbral: number
  envioTarifaAntioquia: number
  envioTarifaCentro: number
  envioTarifaResto: number
  codRecargo: number
  codMunicipios: string[]
}

const DEFAULTS: PublicTiendaConfig = {
  envioGratisUmbral: 150_000,
  envioTarifaAntioquia: 10_000,
  envioTarifaCentro: 15_000,
  envioTarifaResto: 20_000,
  codRecargo: 5_000,
  codMunicipios: ['medellin', 'bello', 'itagui', 'envigado', 'sabaneta'],
}

let cache: PublicTiendaConfig | null = null
let inflight: Promise<PublicTiendaConfig> | null = null

export function useTiendaConfig(): PublicTiendaConfig {
  const [cfg, setCfg] = useState<PublicTiendaConfig>(cache ?? DEFAULTS)

  useEffect(() => {
    if (cache) return
    if (!inflight) {
      inflight = fetch('/api/tienda-config', { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : DEFAULTS))
        .then((j) => ({ ...DEFAULTS, ...j }))
        .catch(() => DEFAULTS)
        .then((c) => {
          cache = c
          return c
        })
    }
    inflight.then(setCfg)
  }, [])

  return cfg
}

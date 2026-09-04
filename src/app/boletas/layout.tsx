import type { Metadata } from 'next'
import { getTiendaConfig } from '@/features/tienda/services/tienda-config'
import Mantenimiento from '@/components/mantenimiento'

export async function generateMetadata(): Promise<Metadata> {
  try {
    const cfg = await getTiendaConfig()
    if (!cfg.boleteriaActiva) return { robots: { index: false, follow: false } }
  } catch {}
  return {}
}

export default async function BoletasLayout({ children }: { children: React.ReactNode }) {
  try {
    const cfg = await getTiendaConfig()
    if (!cfg.boleteriaActiva) {
      return (
        <div className="mx-auto max-w-6xl px-4 pt-20 pb-8">
          <Mantenimiento titulo="Boletería en mantenimiento" mensaje="Estamos preparando la boletería para el próximo evento. Vuelve pronto." />
        </div>
      )
    }
  } catch {}
  return <>{children}</>
}

import type { Metadata } from 'next'
import { getTiendaConfig } from '@/features/tienda/services/tienda-config'
import Mantenimiento from '@/components/mantenimiento'

export async function generateMetadata(): Promise<Metadata> {
  try {
    const cfg = await getTiendaConfig()
    if (!cfg.tiendaActiva) return { robots: { index: false, follow: false } }
  } catch {}
  return {}
}

export default async function TiendaLayout({ children }: { children: React.ReactNode }) {
  try {
    const cfg = await getTiendaConfig()
    if (!cfg.tiendaActiva) {
      return (
        <div className="mx-auto max-w-6xl px-4 pt-20 pb-8">
          <Mantenimiento titulo="Tienda en mantenimiento" mensaje="Estamos preparando la tienda para volver pronto. Gracias por tu paciencia." />
        </div>
      )
    }
  } catch {}
  return <>{children}</>
}

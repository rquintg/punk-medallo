import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Package, PackageSearch, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Breadcrumbs } from '@/components/tienda/breadcrumbs'
import Price from '@/components/tienda/price'

export const metadata: Metadata = {
  title: 'Mis pedidos',
  description: 'Tus pedidos en la tienda Punk Medallo.',
  robots: {
    index: false,
    follow: false,
  },
}

interface PedidoResumen {
  numero_pedido: string
  estado: string
  created_at: string
  total: number
}

const ESTADO_LABEL: Record<string, string> = {
  pendiente: 'Pago pendiente',
  aprobado: 'Confirmado',
  preparando: 'En preparación',
  enviado: 'Enviado',
  entregado: 'Entregado',
  rechazado: 'Rechazado',
  anulado: 'Anulado',
  error: 'Error',
  cancelado: 'Cancelado',
}

export default async function MisPedidosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/cuenta/pedidos')
  }

  const { data: pedidos, error } = await supabase
    .from('pedidos')
    .select('numero_pedido, estado, created_at, total')
    .eq('usuario_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Mis pedidos error:', error)
  }

  const lista: PedidoResumen[] = (pedidos as PedidoResumen[] | null) ?? []

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Breadcrumbs
          segments={[{ label: 'Tienda', href: '/tienda' }, { label: 'Mis pedidos' }]}
        />
      </div>

      <h1 className="text-xl font-bold text-white">Mis pedidos</h1>

      {lista.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-lg border border-neutral-800 bg-[#111] p-10 text-center">
          <Package size={32} className="text-neutral-600" />
          <p className="text-sm text-neutral-400">
            Todavía no tienes pedidos. Cuando compres en la tienda, aparecerán acá.
          </p>
          <Link
            href="/tienda"
            className="mt-2 rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            Ir a la tienda
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {lista.map((pedido) => (
            <li key={pedido.numero_pedido}>
              <Link
                href={`/tienda/orden/${pedido.numero_pedido}`}
                className="group flex items-center justify-between gap-4 rounded-lg border border-neutral-800 bg-[#111] p-4 transition-colors hover:border-[#dc2626]/60"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900">
                    <PackageSearch size={18} className="text-[#dc2626]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {pedido.numero_pedido}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {new Date(pedido.created_at).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}{' '}
                      ·{' '}
                      <span className="text-neutral-400">
                        {ESTADO_LABEL[pedido.estado] ?? pedido.estado}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-white">
                    <Price amount={pedido.total} />
                  </span>
                  <ArrowRight
                    size={16}
                    className="text-neutral-600 transition-colors group-hover:text-[#dc2626]"
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
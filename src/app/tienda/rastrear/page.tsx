import type { Metadata } from 'next'
import { PackageSearch, Truck, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/tienda/breadcrumbs'
import RastrearForm from './rastrear-form'

export const metadata: Metadata = {
  title: 'Rastrear mi pedido',
  description:
    'Seguí el estado de tu pedido en la tienda Punk Medallo: confirmado, en preparación, enviado o entregado.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: '/tienda/rastrear',
  },
}

export default function RastrearPage() {
  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6">
        <Breadcrumbs
          segments={[
            { label: 'Tienda', href: '/tienda' },
            { label: 'Rastrear pedido' },
          ]}
        />
      </div>

      <div className="rounded-lg border border-neutral-800 bg-[#111] p-6">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900">
            <PackageSearch size={26} className="text-[#dc2626]" />
          </div>
          <h1 className="text-xl font-bold text-white">Rastrear mi pedido</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Ingresá el número de pedido y el correo con el que compraste para
            ver el estado y la fecha estimada de entrega.
          </p>
        </div>

        <RastrearForm />

        <div className="mt-6 border-t border-neutral-800 pt-5">
          <p className="flex items-start gap-2 text-xs text-neutral-500">
            <Truck size={14} className="mt-0.5 shrink-0 text-neutral-600" aria-hidden="true" />
            <span>
              Los envíos se despachan de lunes a viernes. El estado se actualiza
              apenas cambia: te llega un correo en cada paso.
            </span>
          </p>
          <p className="mt-3 flex items-start gap-2 text-xs text-neutral-500">
            <HelpCircle size={14} className="mt-0.5 shrink-0 text-neutral-600" aria-hidden="true" />
            <span>
              ¿Dudas? Consultá{' '}
              <Link
                href="/politica-de-cambios"
                className="text-neutral-300 underline decoration-neutral-700 underline-offset-2 hover:text-[#dc2626]"
              >
                la política de cambios
              </Link>{' '}
              o escribinos por{' '}
              <a
                href="https://wa.me/573014453392"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-300 underline decoration-neutral-700 underline-offset-2 hover:text-[#dc2626]"
              >
                WhatsApp
              </a>
              .
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Truck,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Breadcrumbs } from '@/components/tienda/breadcrumbs'
import ScrollToTop from '@/components/scroll-to-top'
import Price from '@/components/tienda/price'
import type { PedidoItem } from '@/features/tienda/types'

interface OrderPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: OrderPageProps): Promise<Metadata> {
  const { id } = await params
  const url = `/tienda/orden/${id}`
  return {
    title: 'Tu Orden',
    description:
      'Sigue el estado de tu pedido en la tienda Punk Medallo.',
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: 'Tu Orden - Punk Medallo',
      description:
        'Sigue el estado de tu pedido en la tienda Punk Medallo.',
      url,
      type: 'website',
      locale: 'es_CO',
      siteName: 'Punk Medallo',
      images: [
        {
          url: 'https://punkmedallo.com/logo_punk_medallo.jpg',
          width: 1200,
          height: 630,
          type: 'image/jpeg',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Tu Orden - Punk Medallo',
      description:
        'Sigue el estado de tu pedido en la tienda Punk Medallo.',
      images: ['https://punkmedallo.com/logo_punk_medallo.jpg'],
    },
  }
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: pedido } = await supabase
    .from('pedidos')
    .select(`
      id,
      numero_pedido,
      nombre_entrega,
      email,
      telefono,
      direccion,
      departamento,
      ciudad,
      barrio,
      notas,
      total,
      estado,
      created_at,
      pedido_items (
        nombre,
        precio,
        talla,
        color,
        cantidad,
        imagen_url
      )
    `)
    .eq('numero_pedido', id)
    .single()

  if (!pedido) {
    notFound()
  }

  const createdDate = new Date(pedido.created_at).toLocaleDateString('es-CO', {
    dateStyle: 'long',
  })

  const estimatedDelivery = new Date(
    new Date(pedido.created_at).getTime() + 5 * 24 * 60 * 60 * 1000,
  ).toLocaleDateString('es-CO', { dateStyle: 'long' })

  const estadoColors: Record<string, string> = {
    pendiente: 'text-yellow-400',
    aprobado: 'text-green-400',
    Preparando: 'text-blue-400',
    enviado: 'text-blue-400',
    entregado: 'text-white',
    rechazado: 'text-red-400',
    anulado: 'text-red-400',
    error: 'text-red-400',
    cancelado: 'text-red-400',
  }

  const estadoConfig: Record<string, { icon: React.ReactNode; title: string }> = {
    pendiente: {
      icon: <Clock size={28} className="text-yellow-500" />,
      title: 'Pago pendiente',
    },
    aprobado: {
      icon: <CheckCircle size={28} className="text-green-500" />,
      title: '¡Pedido confirmado!',
    },
    Preparando: {
      icon: <Package size={28} className="text-blue-500" />,
      title: 'Pedido en preparación',
    },
    enviado: {
      icon: <Truck size={28} className="text-blue-500" />,
      title: 'Pedido enviado',
    },
    entregado: {
      icon: <Package size={28} className="text-green-500" />,
      title: 'Pedido entregado',
    },
    rechazado: {
      icon: <XCircle size={28} className="text-red-500" />,
      title: 'Pedido rechazado',
    },
    anulado: {
      icon: <XCircle size={28} className="text-red-500" />,
      title: 'Pedido anulado',
    },
    error: {
      icon: <AlertCircle size={28} className="text-red-500" />,
      title: 'Error en el pedido',
    },
    cancelado: {
      icon: <XCircle size={28} className="text-red-500" />,
      title: 'Pedido cancelado',
    },
  }

  const config = estadoConfig[pedido.estado] ?? estadoConfig.pendiente

  return (
    <div className="mx-auto max-w-2xl">
      <ScrollToTop />
      <div className="mb-6">
        <Breadcrumbs
          segments={[
            { label: 'Tienda', href: '/tienda' },
            { label: 'Pedido' },
          ]}
        />
      </div>

      <div className="rounded-lg border border-neutral-800 bg-[#111]">
        <div className="border-b border-neutral-800 px-6 py-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-900">
            {config.icon}
          </div>
          <h1 className="text-2xl font-bold text-white">{config.title}</h1>
          <p className="mt-1 text-sm text-neutral-400">{pedido.numero_pedido}</p>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="flex items-center gap-3 text-sm text-neutral-400">
            <Calendar size={16} className="shrink-0 text-neutral-500" />
            <span>
              Pedido realizado el{' '}
              <span className="text-neutral-300">{createdDate}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm text-neutral-400">
            <Package size={16} className="shrink-0 text-neutral-500" />
            <span>
              Llegada estimada:{' '}
              <span className="text-neutral-300">{estimatedDelivery}</span>
            </span>
          </div>

          <div className="flex items-start gap-3 text-sm text-neutral-400">
            <MapPin size={16} className="mt-0.5 shrink-0 text-neutral-500" />
            <span>
              Enviar a{' '}
              <span className="text-neutral-300">
                {pedido.nombre_entrega}, {pedido.direccion}
                {pedido.barrio ? `, ${pedido.barrio}` : ''}, {pedido.ciudad}
                {pedido.departamento ? `, ${pedido.departamento}` : ''}
              </span>
            </span>
          </div>

          {pedido.notas && (
            <div className="flex items-start gap-3 text-sm text-neutral-400">
              <span className="mt-0.5 shrink-0 text-neutral-500">📝</span>
              <span>
                Notas:{' '}
                <span className="text-neutral-300">{pedido.notas}</span>
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm text-neutral-400">
            <span className={`text-xs font-semibold uppercase ${estadoColors[pedido.estado] ?? 'text-neutral-400'}`}>
              Estado: {pedido.estado}
            </span>
          </div>
        </div>

        <div className="border-t border-neutral-800 px-6 py-6">
          <h3 className="mb-4 text-sm font-semibold text-white">
            Productos ({pedido.pedido_items.length})
          </h3>
          <ul className="divide-y divide-neutral-800">
            {pedido.pedido_items.map((item: PedidoItem, i: number) => (
              <li key={i} className="flex gap-3 py-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-neutral-800">
                  {item.imagen_url ? (
                    <Image
                      src={item.imagen_url}
                      alt={item.nombre}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-neutral-600">
                      <Package size={20} />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-center">
                  <p className="text-sm font-medium text-white">{item.nombre}</p>
                  <div className="flex gap-3 text-xs text-neutral-500">
                    {item.talla && <span>Talla: {item.talla}</span>}
                    {item.color && <span>Color: {item.color}</span>}
                    <span>Cant: {item.cantidad}</span>
                  </div>
                </div>
                <span className="self-center text-sm font-medium text-white">
                  <Price amount={item.precio * item.cantidad} />
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-neutral-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-400">Total</span>
            <span className="text-lg font-bold text-[#dc2626]">
              <Price amount={pedido.total} />
            </span>
          </div>
        </div>

        <div className="border-t border-neutral-800 px-6 py-5 text-center">
          <Link
            href="/tienda"
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            <ArrowLeft size={16} />
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  )
}

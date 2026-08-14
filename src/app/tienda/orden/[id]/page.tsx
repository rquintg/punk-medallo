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
  CreditCard,
  MessageCircle,
  PackageSearch,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Breadcrumbs } from '@/components/tienda/breadcrumbs'
import ScrollToTop from '@/components/scroll-to-top'
import Price from '@/components/tienda/price'
import OrderTimeline from '@/components/tienda/order-timeline'
import { getDiasEntrega } from '@/data/envio'
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
      envio,
      recargo,
      estado,
      created_at,
      fecha_aprobado,
      fecha_preparando,
      fecha_enviado,
      fecha_entregado,
      metodo_pago,
      referencia_pago,
      pagado_at,
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

  const [diasMin, diasMax] = getDiasEntrega(pedido.departamento)

  const deliveryMin = new Date(
    new Date(pedido.created_at).getTime() + diasMin * 24 * 60 * 60 * 1000,
  ).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })

  const deliveryMax = new Date(
    new Date(pedido.created_at).getTime() + diasMax * 24 * 60 * 60 * 1000,
  ).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })

  const estimatedDelivery =
    diasMin === diasMax ? deliveryMin : `entre ${deliveryMin} y ${deliveryMax}`

  const estado = (pedido.estado ?? '').toLowerCase()

  const estadoConfig: Record<string, { icon: React.ReactNode; title: string }> = {
    pendiente: {
      icon: <Clock size={28} className="text-yellow-500" />,
      title: 'Pago pendiente',
    },
    aprobado: {
      icon: <CheckCircle size={28} className="text-green-500" />,
      title: '¡Pedido confirmado!',
    },
    preparando: {
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

  const config = estadoConfig[estado] ?? estadoConfig.pendiente

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

          <div className="rounded-md border border-neutral-800 bg-[#181818] p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">
              Estado del pedido
            </p>
            <OrderTimeline
              estado={estado}
              fechas={{
                aprobado: pedido.fecha_aprobado,
                preparando: pedido.fecha_preparando,
                enviado: pedido.fecha_enviado,
                entregado: pedido.fecha_entregado,
              }}
            />
          </div>
        </div>

        <div className="border-t border-neutral-800 px-6 py-6">
          <h3 className="mb-4 text-sm font-semibold text-white">
            Pago
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-neutral-400">
              <CreditCard size={16} className="shrink-0 text-neutral-500" />
              <span>
                Método:{' '}
                <span className="text-neutral-300">
                  {pedido.metodo_pago
                    ? pedido.metodo_pago === 'CONTRA_ENTREGA'
                      ? 'Contra entrega (efectivo)'
                      : pedido.metodo_pago.toUpperCase()
                    : '—'}
                </span>
              </span>
            </div>
            {pedido.metodo_pago === 'CONTRA_ENTREGA' && estado !== 'entregado' && (
              <p className="rounded-md border border-yellow-900/60 bg-yellow-950/40 px-3 py-2 text-xs text-yellow-400">
                Pagás en efectivo al recibir el pedido. Tené el cambio listo para el momento de la entrega.
              </p>
            )}
            {pedido.referencia_pago && (
              <div className="flex items-center gap-3 text-neutral-400">
                <span className="shrink-0 font-mono text-xs text-neutral-600">Ref:</span>
                <span className="font-mono text-xs text-neutral-300">
                  {pedido.referencia_pago}
                </span>
              </div>
            )}
            {pedido.pagado_at && (
              <div className="flex items-center gap-3 text-neutral-400">
                <CheckCircle size={16} className="shrink-0 text-emerald-500" />
                <span>
                  Pagado el{' '}
                  <span className="text-neutral-300">
                    {new Date(pedido.pagado_at).toLocaleString('es-CO', {
                      dateStyle: 'long',
                      timeStyle: 'short',
                    })}
                  </span>
                </span>
              </div>
            )}
            {estado === 'pendiente' && (
              <p className="rounded-md border border-yellow-900/60 bg-yellow-950/40 px-3 py-2 text-xs text-yellow-400">
                El pago está pendiente. Si ya pagaste, puede tardar unos minutos
                en confirmarse.
              </p>
            )}
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
            <span className="text-sm text-neutral-400">Subtotal</span>
            <span className="text-sm font-medium text-white">
              <Price amount={pedido.total - (pedido.envio ?? 0) - (pedido.recargo ?? 0)} />
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-neutral-400">Envío</span>
            {(pedido.envio ?? 0) === 0 ? (
              <span className="text-sm font-medium text-emerald-400">Gratis</span>
            ) : (
              <span className="text-sm font-medium text-white">
                <Price amount={pedido.envio!} />
              </span>
            )}
          </div>
          {(pedido.recargo ?? 0) > 0 && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-neutral-400">Contra entrega</span>
              <span className="text-sm font-medium text-white">
                <Price amount={pedido.recargo!} />
              </span>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between border-t border-neutral-800 pt-3">
            <span className="text-sm text-neutral-400">Total</span>
            <span className="text-lg font-bold text-[#dc2626]">
              <Price amount={pedido.total} />
            </span>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-neutral-800 bg-[#111] p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111a14]">
                <MessageCircle size={18} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  ¿Dudas con tu pedido?
                </p>
                <p className="text-xs text-neutral-500">
                  Escribinos por WhatsApp, te respondemos rápido.
                </p>
              </div>
            </div>
            <a
              href="https://wa.me/573014453392"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-emerald-700 bg-emerald-950/40 px-4 py-2 text-sm font-semibold text-emerald-400 transition-colors hover:bg-emerald-900/40 hover:text-emerald-300"
            >
              <MessageCircle size={15} />
              WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <Link
            href="/tienda"
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            <ArrowLeft size={16} />
            Seguir comprando
          </Link>
          <p className="font-mono text-xs text-neutral-600">
            ¿Perdiste el link?{' '}
            <Link
              href="/tienda/rastrear"
              className="inline-flex items-center gap-1 text-neutral-400 transition-colors hover:text-[#dc2626]"
            >
              <PackageSearch size={12} aria-hidden="true" />
              Rastrear pedido
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

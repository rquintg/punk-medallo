import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, MessageCircle, PackageSearch } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Breadcrumbs } from '@/components/tienda/breadcrumbs'
import ScrollToTop from '@/components/scroll-to-top'
import OrderDetails, {
  type MetodoPagoInfo,
  type OrderDetailsItem,
} from '@/components/tienda/order-details'
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

const ESTADOS_TERMINALES: Record<string, string> = {
  rechazado: 'Pedido rechazado',
  anulado: 'Pedido anulado',
  error: 'Error en el pedido',
  cancelado: 'Pedido cancelado',
}

const LOGOS_METODO: Record<string, string> = {
  VISA: '/pagos/visa.png',
  MASTERCARD: '/pagos/symbol.png',
  NEQUI: '/pagos/nequi.png',
  BANCOLOMBIA: '/pagos/bancolombia.png',
}

function infoMetodoPago(mp: string | null): {
  logo: string | null
  nombre: string
  linea: string
} {
  const m = mp?.toUpperCase() ?? ''
  switch (m) {
    case 'CONTRA_ENTREGA':
      return { logo: null, nombre: 'Contra entrega', linea: 'Efectivo al recibir' }
    case 'VISA':
      return { logo: LOGOS_METODO.VISA, nombre: 'Visa', linea: 'Pago con tarjeta Visa' }
    case 'MASTERCARD':
      return { logo: LOGOS_METODO.MASTERCARD, nombre: 'Mastercard', linea: 'Pago con tarjeta Mastercard' }
    case 'NEQUI':
      return { logo: LOGOS_METODO.NEQUI, nombre: 'Nequi', linea: 'Pago con Nequi' }
    case 'BANCOLOMBIA':
      return { logo: LOGOS_METODO.BANCOLOMBIA, nombre: 'Bancolombia', linea: 'Pago con Bancolombia' }
    default:
      return { logo: '/pagos/wompi.png', nombre: 'Wompi', linea: 'Pago online (Wompi)' }
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

  const entregaEstimada =
    diasMin === diasMax ? deliveryMin : `entre ${deliveryMin} y ${deliveryMax}`

  const estado = (pedido.estado ?? '').toLowerCase()

  const estadoTerminal = ESTADOS_TERMINALES[estado]
  const subtitulo = estadoTerminal
    ? `${estadoTerminal} — realizado el ${createdDate}`
    : `Pedido realizado el ${createdDate}`

  const { logo, nombre, linea } = infoMetodoPago(pedido.metodo_pago)

  const metodo: MetodoPagoInfo = {
    logo,
    nombre,
    linea,
    detalle: pedido.pagado_at
      ? `Pagado el ${new Date(pedido.pagado_at).toLocaleString('es-CO', {
          dateStyle: 'long',
          timeStyle: 'short',
        })}`
      : null,
    ref: pedido.referencia_pago ?? null,
  }

  const notaMetodo =
    pedido.metodo_pago === 'CONTRA_ENTREGA' && estado !== 'entregado'
      ? 'Pagás en efectivo al recibir el pedido. Tené el cambio listo para el momento de la entrega.'
      : estado === 'pendiente'
        ? 'El pago está pendiente. Si ya pagaste, puede tardar unos minutos en confirmarse.'
        : null

  const items: OrderDetailsItem[] = (pedido.pedido_items ?? []).map(
    (item: PedidoItem) => ({
      imagen: item.imagen_url,
      nombre: item.nombre,
      detalle: item.color ?? null,
      talla: item.talla ?? null,
      cantidad: item.cantidad,
      precio: item.precio,
    }),
  )

  const envio = pedido.envio ?? 0
  const recargo = pedido.recargo ?? 0
  const subtotal = pedido.total - envio - recargo

  const filasResumen = [
    { titulo: 'Subtotal', valor: subtotal },
    { titulo: 'Envío', valor: envio, gratis: envio === 0 },
    ...(recargo > 0
      ? [{ titulo: 'Contra entrega', valor: recargo }]
      : []),
  ]

  return (
    <div>
      <ScrollToTop />
      <div className="mx-auto max-w-7xl px-4 pt-6">
        <Breadcrumbs
          segments={[
            { label: 'Tienda', href: '/tienda' },
            { label: 'Pedido' },
          ]}
        />
      </div>

      <OrderDetails
        numero={pedido.numero_pedido}
        subtitulo={subtitulo}
        fechaIso={pedido.created_at}
        estado={estado}
        fechas={{
          aprobado: pedido.fecha_aprobado,
          preparando: pedido.fecha_preparando,
          enviado: pedido.fecha_enviado,
          entregado: pedido.fecha_entregado,
        }}
        entregaEstimada={entregaEstimada}
        items={items}
        filasResumen={filasResumen}
        total={pedido.total}
        direccionLineas={[
          pedido.nombre_entrega,
          pedido.direccion,
          ...(pedido.barrio ? [pedido.barrio] : []),
          [pedido.ciudad, pedido.departamento].filter(Boolean).join(', '),
          pedido.telefono,
        ].filter(Boolean)}
        metodo={metodo}
        notaMetodo={notaMetodo}
      />

      <div className="container mx-auto max-w-7xl px-4 pb-16">
        <div className="rounded-lg border border-neutral-800 bg-[#111] p-5">
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
              href={`https://wa.me/573014453392?text=${encodeURIComponent(`Hola, escribo por mi pedido ${pedido.numero_pedido}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-emerald-700 bg-emerald-950/40 px-4 py-2 text-sm font-semibold text-emerald-400 transition-colors hover:bg-emerald-900/40 hover:text-emerald-300"
            >
              <MessageCircle size={15} />
              WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
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

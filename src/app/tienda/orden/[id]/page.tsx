import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, MessageCircle, PackageSearch, ShieldCheck } from 'lucide-react'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/features/admin/services/supabase-admin'
import { Breadcrumbs } from '@/components/tienda/breadcrumbs'
import ScrollToTop from '@/components/scroll-to-top'
import OrderDetails, {
  type MetodoPagoInfo,
  type OrderDetailsItem,
} from '@/components/tienda/order-details'
import { getDiasEntrega } from '@/data/envio'
import { metodoPagoInfo } from '@/lib/metodo-pago'
import {
  mascararDireccion,
  mascararEmail,
  mascararNombre,
  mascararReferencia,
  mascararTelefono,
} from '@/lib/mascarar'
import { ORDER_VERIFY_COOKIE, verificarFirma } from '@/lib/order-verify'
import VerificarOrdenForm from '../verificar-orden-form'
import type { PedidoItem } from '@/features/tienda/types'
import { ogImageActual } from '@/features/tienda/utils/seo'

interface OrderPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: OrderPageProps): Promise<Metadata> {
  const { id } = await params
  const url = `/tienda/orden/${id}`
  const ogImage = await ogImageActual()
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
          url: ogImage,
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
      images: [ogImage],
    },
  }
}

const ESTADOS_TERMINALES: Record<string, string> = {
  rechazado: 'Pedido rechazado',
  anulado: 'Pedido anulado',
  error: 'Error en el pedido',
  cancelado: 'Pedido cancelado',
}

interface PedidoDetalleItem {
  nombre: string
  precio: number
  talla: string | null
  color: string | null
  cantidad: number
  imagen_url: string | null
}

interface PedidoDetalle {
  id: string
  numero_pedido: string
  nombre_entrega: string
  email: string
  telefono: string | null
  direccion: string | null
  departamento: string | null
  ciudad: string | null
  barrio: string | null
  notas: string | null
  total: number
  envio: number | null
  recargo: number | null
  descuento: number | null
  cupon_codigo: string | null
  estado: string | null
  created_at: string
  fecha_aprobado: string | null
  fecha_preparando: string | null
  fecha_enviado: string | null
  fecha_entregado: string | null
  metodo_pago: string | null
  referencia_pago: string | null
  pagado_at: string | null
  pedido_items: PedidoDetalleItem[] | null
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const supabaseAdmin = getSupabaseAdmin()

  const { data } = await supabaseAdmin
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
      descuento,
      cupon_codigo,
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

  const pedido = data as unknown as PedidoDetalle | null

  if (!pedido) {
    notFound()
  }

  const [cookieStore, { data: authData }] = await Promise.all([
    cookies(),
    supabase.auth.getUser(),
  ])

  const emailPedido = (pedido.email ?? '').toLowerCase()
  const verificado =
    verificarFirma(pedido.numero_pedido, cookieStore.get(ORDER_VERIFY_COOKIE)?.value) ||
    (authData.user?.email !== undefined &&
      authData.user.email.toLowerCase() === emailPedido)

  const direccion = {
    nombre: (verificado
      ? pedido.nombre_entrega
      : mascararNombre(pedido.nombre_entrega)) || '—',
    correo: verificado ? pedido.email : mascararEmail(pedido.email),
    direccion: verificado ? pedido.direccion : mascararDireccion(pedido.direccion),
    barrio: verificado ? pedido.barrio : mascararDireccion(pedido.barrio),
    ciudad: pedido.ciudad,
    departamento: pedido.departamento,
    telefono: verificado ? pedido.telefono : mascararTelefono(pedido.telefono),
    notas: verificado ? pedido.notas : null,
  }

  const emailMostrado = mascararEmail(pedido.email)

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

  const { logo, nombre, linea } = metodoPagoInfo(pedido.metodo_pago)

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
    ref: verificado
      ? (pedido.referencia_pago ?? null)
      : mascararReferencia(pedido.referencia_pago),
  }

  const notaMetodo =
    pedido.metodo_pago === 'CONTRA_ENTREGA' && estado !== 'entregado'
      ? 'Pagas en efectivo al recibir el pedido. Ten el cambio listo para el momento de la entrega.'
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
  const descuento = pedido.descuento ?? 0
  const subtotal = pedido.total + descuento - envio - recargo

  const filasResumen = [
    { titulo: 'Subtotal', valor: subtotal },
    { titulo: 'Envío', valor: envio, gratis: envio === 0 },
    ...(recargo > 0
      ? [{ titulo: 'Contra entrega', valor: recargo }]
      : []),
    ...(descuento > 0
      ? [
          {
            titulo: pedido.cupon_codigo
              ? `Descuento (${pedido.cupon_codigo})`
              : 'Descuento',
            valor: -descuento,
          },
        ]
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

      {!verificado && (
        <div className="container mx-auto max-w-7xl px-4 pt-6">
          <div className="rounded-lg border border-neutral-800 bg-[#111] p-5 sm:p-6">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-950/60">
                <ShieldCheck size={18} className="text-red-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Tus datos de envío están ocultos
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Para proteger tu privacidad, ocultamos la dirección y el
                  teléfono. Verificalo con el correo del pedido
                  {emailMostrado ? (
                    <>
                      {' '}
                      (<span className="text-neutral-400">{emailMostrado}</span>)
                    </>
                  ) : null}{' '}
                  para verlos completos.
                </p>
              </div>
            </div>
            <VerificarOrdenForm numero={pedido.numero_pedido} />
          </div>
        </div>
      )}

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
        direccion={direccion}
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
                  Escribenos por WhatsApp, te respondemos rápido.
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

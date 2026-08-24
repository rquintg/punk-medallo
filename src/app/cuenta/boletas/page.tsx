import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import QRCode from 'qrcode'
import { CalendarDays, MapPin, QrCode, Ticket } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { construirQrPayload } from '@/lib/ticket-crypto'
import { Breadcrumbs } from '@/components/tienda/breadcrumbs'
import ReenviarBoletaButton from './reenviar-boleta-button'

export const metadata: Metadata = {
  title: 'Mis boletas',
  description: 'Tus boletas con QR único para los eventos de Punk Medallo.',
  robots: { index: false, follow: false },
}

interface BoletaCuenta {
  id: string
  codigo: string
  estado: 'valida' | 'usada' | 'anulada'
  created_at: string
  tipo_nombre: string
  evento_titulo: string
  evento_fecha: string
  evento_lugar: string
}

const ESTADO_STYLE: Record<BoletaCuenta['estado'], { label: string; cls: string }> = {
  valida: { label: 'Válida', cls: 'border-emerald-600/50 bg-emerald-950/30 text-emerald-400' },
  usada: { label: 'Usada', cls: 'border-neutral-700 bg-neutral-800 text-neutral-300' },
  anulada: { label: 'Anulada', cls: 'border-red-900/60 bg-red-950/30 text-red-400' },
}

export default async function MisBoletasPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/cuenta/boletas')

  const { data, error } = await (supabase.from('boletas') as any)
    .select(`
      id,
      codigo,
      estado,
      created_at,
      tipos_boleta(nombre),
      eventos_boletos(titulo, fecha_evento, lugar)
    `)
    .order('created_at', { ascending: false })

  if (error) console.error('Mis boletas error:', error)

  const boletas: BoletaCuenta[] = ((data ?? []) as any[]).map((b) => ({
    id: b.id,
    codigo: b.codigo,
    estado: b.estado,
    created_at: b.created_at,
    tipo_nombre: Array.isArray(b.tipos_boleta) ? b.tipos_boleta[0]?.nombre : b.tipos_boleta?.nombre,
    evento_titulo: Array.isArray(b.eventos_boletos) ? b.eventos_boletos[0]?.titulo : b.eventos_boletos?.titulo,
    evento_fecha: Array.isArray(b.eventos_boletos) ? b.eventos_boletos[0]?.fecha_evento : b.eventos_boletos?.fecha_evento,
    evento_lugar: Array.isArray(b.eventos_boletos) ? b.eventos_boletos[0]?.lugar : b.eventos_boletos?.lugar,
  }))

  // QR PNG data-url generado server-side (no depende de APIs externas)
  const conQr = await Promise.all(
    boletas.map(async (b) => ({
      ...b,
      qrDataUrl: await QRCode.toDataURL(construirQrPayload(b.codigo), {
        width: 320,
        margin: 1,
        color: { dark: '#111111', light: '#ffffff' },
      }),
    })),
  )

  return (
    <div className="mx-auto max-w-2xl">
      <Breadcrumbs segments={[{ label: 'Tienda', href: '/tienda' }, { label: 'Mis boletas' }]} />

      <h1 className="mt-4 text-xl font-bold text-white">Mis boletas</h1>

      {conQr.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-lg border border-neutral-800 bg-[#111] p-10 text-center">
          <Ticket size={32} className="text-neutral-600" />
          <p className="text-sm text-neutral-400">
            Todavía no tienes boletas. Cuando compres para un concierto, aparecerán acá.
          </p>
          <Link
            href="/boletas"
            className="mt-2 rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            Ver boletas disponibles
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {conQr.map((b) => {
            const estado = ESTADO_STYLE[b.estado]
            return (
              <article
                key={b.id}
                className="overflow-hidden rounded-xl border border-neutral-800 bg-[#111]"
              >
                {/* Encabezado del evento */}
                <div className="border-b border-neutral-800 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-bold leading-tight text-white">{b.evento_titulo}</h2>
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs capitalize text-neutral-400">
                        <CalendarDays size={13} className="text-[#dc2626]" />
                        {new Date(b.evento_fecha).toLocaleString('es-CO', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-neutral-400">
                        <MapPin size={13} className="text-[#dc2626]" />
                        {b.evento_lugar}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${estado.cls}`}>
                      {estado.label}
                    </span>
                  </div>
                  <p className="mt-2 inline-block rounded-md bg-neutral-900 px-2 py-1 text-xs text-neutral-300">
                    {b.tipo_nombre ?? 'General'}
                  </p>
                </div>

                {/* QR + código */}
                <div className="flex flex-col items-center gap-3 p-5 sm:flex-row sm:items-center sm:gap-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.qrDataUrl}
                    alt={`QR ${b.codigo}`}
                    width={150}
                    height={150}
                    className={`rounded-lg ${b.estado === 'valida' ? '' : 'opacity-40 grayscale'}`}
                  />
                  <div className="min-w-0 flex-1 text-center sm:text-left">
                    <p className="flex items-center justify-center gap-1.5 font-mono text-base font-bold tracking-widest text-[#ff4444] sm:justify-start">
                      <QrCode size={15} />
                      {b.codigo}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      A nombre de tu cuenta · escanea una sola vez en la puerta
                    </p>
                    <p className="mt-0.5 text-[11px] text-neutral-600">
                      Comprada el{' '}
                      {new Date(b.created_at).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                      <a
                        href={b.qrDataUrl}
                        download={`${b.codigo}.png`}
                        className="rounded-md border border-neutral-700 px-3 py-1.5 text-xs font-semibold text-neutral-300 transition-colors hover:bg-neutral-800"
                      >
                        Descargar QR
                      </a>
                      {b.estado === 'valida' && (
                        <ReenviarBoletaButton codigo={b.codigo} />
                      )}
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

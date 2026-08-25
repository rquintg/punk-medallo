'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CalendarDays, Clock, MailCheck, MapPin, ShieldAlert, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import Price from '@/components/tienda/price'

export interface PagoResumenFila {
  titulo: string
  valor: number | null
  gratis?: boolean
}

export default function BoletaOrdenView({
  numero,
  fechaStr,
  bannerLabel,
  bannerTone,
  notaAnulado,
  verificado,
  titularMostrado,
  emailMostrado,
  cantidadBoletas,
  codigos,
  evento,
  metodo,
  referencia,
  filasResumen,
  total,
}: {
  numero: string
  fechaStr: string
  bannerLabel: string
  bannerTone: 'amber' | 'green' | 'red'
  notaAnulado?: string
  verificado: boolean
  titularMostrado: string
  emailMostrado: string | null
  cantidadBoletas: number
  codigos: string[]
  evento: {
    titulo: string
    fechaStr: string
    lugar: string
    puertas: string | null
    edadMinima: number | null
  } | null
  metodo: { nombre: string; logo: string | null; linea: string }
  referencia: string | null
  filasResumen: PagoResumenFila[]
  total: number
}) {
  const bannerCls =
    bannerTone === 'green'
      ? 'border-emerald-700/50 bg-emerald-950/30'
      : bannerTone === 'red'
        ? 'border-red-800/60 bg-red-950/30'
        : 'border-amber-700/50 bg-amber-950/30'
  const bannerText = bannerTone === 'green' ? 'text-emerald-400' : bannerTone === 'red' ? 'text-red-400' : 'text-amber-300'

  const esPendiente = bannerTone === 'amber'

  return (
    <div className="space-y-6">
      {/* Hero de confirmación */}
      <div className="overflow-hidden rounded-xl border border-neutral-800 bg-[#111] p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          {bannerTone === 'green' ? (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 ring-2 ring-emerald-500/60">
              <ShieldCheck size={34} className="text-emerald-400" />
            </span>
          ) : bannerTone === 'red' ? (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 ring-2 ring-red-600/60">
              <ShieldAlert size={32} className="text-red-400" />
            </span>
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 ring-2 ring-amber-500/60">
              <Clock size={30} className="text-amber-300" />
            </span>
          )}
        </div>

        <h1 className="text-2xl font-black uppercase italic tracking-wide text-white md:text-3xl">
          {bannerLabel}
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          Pedido <span className="font-mono font-semibold text-neutral-200">{numero}</span> · {fechaStr}
        </p>
        {notaAnulado && (
          <p className={`mx-auto mt-3 max-w-md text-sm ${bannerText}`}>{notaAnulado}</p>
        )}
        {!verificado && !esPendiente && (
          <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-neutral-500">
            Verifica tu correo (formulario arriba) para ver los datos completos de la compra.
          </p>
        )}
      </div>

      {/* Evento */}
      {evento && (
        <section className="rounded-xl border border-neutral-800 bg-[#111] p-5 sm:p-6">
          <p className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.35em] text-[#dc2626]">
            <CalendarDays size={14} /> Evento
          </p>
          <h2 className="text-xl font-black uppercase italic tracking-wide text-white">
            {evento.titulo}
          </h2>
          <div className="mt-3 space-y-1.5 text-sm capitalize text-neutral-300">
            <p className="flex items-center gap-2">
              <CalendarDays size={15} className="shrink-0 text-[#dc2626]" />
              {evento.fechaStr}
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={15} className="shrink-0 text-[#dc2626]" />
              {evento.lugar}
            </p>
            {evento.puertas && (
              <p className="flex items-center gap-2 text-neutral-400">
                <Clock size={15} className="shrink-0 text-neutral-500" />
                Puertas: {evento.puertas}
              </p>
            )}
          </div>
          {evento.edadMinima != null && (
            <span className="mt-3 inline-block rounded-md border border-amber-700/50 bg-amber-950/30 px-2.5 py-1 text-xs font-semibold text-amber-400">
              Solo mayores de {evento.edadMinima} años
            </span>
          )}
        </section>
      )}

      {/* Bloque email — estrella del diseño */}
      <section
        className={`rounded-xl border-2 border-dashed p-5 sm:p-6 ${
          esPendiente || bannerTone === 'red'
            ? 'border-neutral-800 bg-[#111] opacity-80'
            : 'border-[rgba(164,2,2,0.45)] bg-[rgba(164,2,2,0.06)]'
        }`}
      >
        <div className="mb-4 flex items-start gap-3">
          <MailCheck size={22} className={esPendiente || bannerTone === 'red' ? 'shrink-0 text-neutral-500' : 'shrink-0 text-emerald-400'} />
          <div>
            <h3 className="font-bold uppercase tracking-wide text-white">
              {esPendiente
                ? 'Boletas al confirmar tu pago'
                : bannerTone === 'red'
                  ? 'Boletas anuladas'
                  : 'Tus boletas fueron enviadas'}
            </h3>
            {!esPendiente && bannerTone !== 'red' && (
              <p className="mt-1 text-sm text-neutral-300">
                Enviamos{' '}
                <span className="font-bold text-white">
                  {cantidadBoletas} boleta{cantidadBoletas !== 1 ? 's' : ''}
                </span>{' '}
                con QR único a{' '}
                <span className="font-semibold text-white">{emailMostrado ?? 'tu correo'}</span>
              </p>
            )}
            {esPendiente && (
              <p className="mt-1 text-sm text-neutral-400">
                Al confirmarse el pago llegarán a{' '}
                <span className="font-medium">{emailMostrado ?? 'tu correo'}</span>.
              </p>
            )}
            {bannerTone === 'red' && (
              <p className="mt-1 text-sm text-neutral-400">Las boletas de este pedido fueron anuladas.</p>
            )}
          </div>
        </div>

        {/* Acciones solo cuando las boletas están activas */}
        {bannerTone === 'green' && verificado && cantidadBoletas > 0 && (
          <div className="flex flex-wrap items-center gap-3 pl-9">
            {codigos.length > 0 && (
              <ReenviarTodasButton codigos={codigos} />
            )}
            <Link
              href="/cuenta/boletas"
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 px-4 py-2 text-sm font-semibold text-neutral-200 transition-colors hover:bg-neutral-800"
            >
              Ver mis boletas →
            </Link>
          </div>
        )}

        <div className="mt-4 flex items-start gap-2 pl-9">
          <ShieldCheck size={14} className="mt-0.5 shrink-0 text-neutral-500" />
          <p className="text-[11px] leading-relaxed text-neutral-500">
            En la puerta presenta el QR desde tu correo junto con tu documento de identidad.
            La boleta es personal y se escanea una sola vez.
          </p>
        </div>
      </section>

      {/* Pago */}
      <section className="rounded-xl border border-neutral-800 bg-[#111] p-5 sm:p-6">
        <p className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.35em] text-[#dc2626]">
          Pago
        </p>
        {metodo.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={metodo.logo} alt={metodo.nombre} className="mb-3 h-9 w-auto" />
        )}
        <p className="text-sm text-neutral-300">{metodo.linea}</p>
        {referencia && (
          <p className="mt-1 truncate font-mono text-xs text-neutral-500">Ref: {referencia}</p>
        )}

        <div className="mt-4 space-y-1.5 border-t border-neutral-800 pt-4">
          {filasResumen.map((f, k) => (
            <div key={k} className="flex justify-between text-sm">
              <span className="text-neutral-400">{f.titulo}</span>
              {f.valor !== null && f.valor < 0 ? (
                <span className="font-medium text-emerald-400">
                  −<Price amount={-f.valor} />
                </span>
              ) : (
                <span className="text-neutral-200">
                  {f.gratis ? 'Gratis' : <Price amount={f.valor ?? 0} />}
                </span>
              )}
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-neutral-800 pt-3">
            <span className="font-bold text-white">Total</span>
            <span className="text-xl font-black text-white"><Price amount={total} /></span>
          </div>
        </div>
      </section>

      {/* Nombre del comprador (pie discreto) */}
      <p className="text-center text-xs text-neutral-600">
        Compra a nombre de <span className="capitalize">{titularMostrado}</span> ·{' '}
        <span className="font-mono">{numero}</span>
      </p>
    </div>
  )
}
/** Reenvía todas las boletas del pedido vía el endpoint existente (una por código) */
function ReenviarTodasButton({ codigos }: { codigos: string[] }) {
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  async function handleReenviar() {
    setEnviando(true)
    try {
      let fallos = 0
      for (const c of codigos) {
        const res = await fetch('/api/cuenta/boletas/reenviar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ codigo: c }),
        })
        if (!res.ok) fallos++
      }
      if (fallos === 0) {
        toast.success('Correo enviado — revisa tu bandeja')
        setEnviado(true)
      } else {
        toast.error(`No se pudo reenviar ${fallos} boleta${fallos !== 1 ? 's' : ''}`)
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setEnviando(false)
    }
  }

  if (enviado) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-700/60 bg-emerald-950/30 px-4 py-2 text-sm font-semibold text-emerald-400">
        <MailCheck size={15} /> Correo enviado
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={handleReenviar}
      disabled={enviando}
      className="inline-flex items-center gap-1.5 rounded-lg bg-[#dc2626] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
    >
      {enviando ? 'Reenviando...' : 'Reenviar correo'}
    </button>
  )
}

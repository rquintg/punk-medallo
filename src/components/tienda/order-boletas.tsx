'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  MailCheck,
  MessageCircle,
  ShieldAlert,
  ShieldCheck,
  Ticket,
  User,
  Receipt,
} from 'lucide-react'
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
  const esAnulado = bannerTone === 'red'

  return (
    <div className="space-y-6">
      {/* ================== HERO TICKET STUB ================== */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-br from-[#1a0a0a] via-[#140707] to-[#0a0a0a]">
        {/* Patrón decorativo */}
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `repeating-linear-gradient(45deg, #dc2626 0 1px, transparent 1px 10px)` }} aria-hidden />

        {/* Header con número de pedido y badge de estado */}
        <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-neutral-800 px-6 py-4 sm:px-8">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-500">
            <Receipt size={13} className="text-[#dc2626]" />
            Pedido <span className="font-semibold text-neutral-300">{numero}</span>
          </div>
          <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${bannerCls} ${bannerText}`}>
            {bannerTone === 'green' ? <ShieldCheck size={13} /> : bannerTone === 'red' ? <ShieldAlert size={13} /> : <Clock size={13} />}
            {bannerLabel}
          </div>
        </div>

        {/* Contenido principal: título del evento + fecha destacada */}
        <div className="relative grid gap-6 px-6 py-8 sm:px-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="mb-2 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.3em] text-[#dc2626]">
              <Ticket size={12} /> Tu entrada
            </p>
            {evento ? (
              <>
                <h1 className="text-3xl font-black uppercase italic leading-[1.05] tracking-tight text-white md:text-5xl">
                  {evento.titulo}
                </h1>
                <p className="mt-3 text-sm text-neutral-400">{fechaStr}</p>
              </>
            ) : (
              <h1 className="text-3xl font-black uppercase italic tracking-tight text-white md:text-4xl">
                {bannerLabel}
              </h1>
            )}

            {notaAnulado && (
              <p className={`mt-3 text-sm ${bannerText}`}>{notaAnulado}</p>
            )}
          </div>

          {/* Stub lateral con cantidad */}
          <div className="relative md:text-right">
            <div className="inline-flex items-center gap-3 rounded-xl border border-neutral-800 bg-black/40 px-5 py-4 md:flex-col md:items-end md:gap-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Boletas</span>
              <span className="text-3xl font-black leading-none text-white">×{cantidadBoletas}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================== DATOS DEL EVENTO ================== */}
      {evento && (
        <section className="rounded-xl border border-neutral-800 bg-[#111] p-5 sm:p-6">
          <p className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-[#dc2626]">
            <CalendarDays size={13} /> Detalles del evento
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg border border-neutral-800 bg-black/30 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#dc2626]/10 text-[#dc2626]">
                <CalendarDays size={17} />
              </div>
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Fecha y hora</p>
                <p className="mt-0.5 text-sm font-semibold capitalize text-white">{evento.fechaStr}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-neutral-800 bg-black/30 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#dc2626]/10 text-[#dc2626]">
                <MapPin size={17} />
              </div>
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Lugar</p>
                <p className="mt-0.5 text-sm font-semibold text-white">{evento.lugar}</p>
              </div>
            </div>
            {evento.puertas && (
              <div className="flex items-start gap-3 rounded-lg border border-neutral-800 bg-black/30 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-neutral-800 text-neutral-400">
                  <Clock size={17} />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Apertura de puertas</p>
                  <p className="mt-0.5 text-sm font-semibold text-white">{evento.puertas}</p>
                </div>
              </div>
            )}
            {evento.edadMinima != null && (
              <div className="flex items-start gap-3 rounded-lg border border-amber-700/40 bg-amber-950/20 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-400">
                  <ShieldCheck size={17} />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-amber-400/80">Restricción</p>
                  <p className="mt-0.5 text-sm font-semibold text-amber-200">Solo mayores de {evento.edadMinima} años</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ================== BOLETAS ================== */}
      <section
        className={`rounded-xl border-2 p-5 sm:p-6 ${
          esPendiente || esAnulado
            ? 'border-neutral-800 bg-[#111]'
            : 'border-[#a40202]/50 bg-gradient-to-br from-[rgba(164,2,2,0.08)] to-[#111]'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            esAnulado ? 'bg-red-500/10 text-red-400' : esPendiente ? 'bg-amber-500/10 text-amber-300' : 'bg-emerald-500/10 text-emerald-400'
          }`}>
            <MailCheck size={19} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold uppercase tracking-wide text-white">
              {esPendiente
                ? 'Tus boletas esperan la confirmación del pago'
                : esAnulado
                  ? 'Boletas anuladas'
                  : 'Tus boletas fueron enviadas'}
            </h3>
            {!esPendiente && !esAnulado && (
              <p className="mt-1 text-sm text-neutral-300">
                Enviamos{' '}
                <span className="font-bold text-white">
                  {cantidadBoletas} boleta{cantidadBoletas !== 1 ? 's' : ''}
                </span>{' '}
                con código único a{' '}
                <span className="font-semibold text-white">{emailMostrado ?? 'tu correo'}</span>
              </p>
            )}
            {esPendiente && (
              <p className="mt-1 text-sm text-neutral-400">
                Al confirmarse el pago llegarán a{' '}
                <span className="font-medium text-white">{emailMostrado ?? 'tu correo'}</span>.
              </p>
            )}
            {esAnulado && (
              <p className="mt-1 text-sm text-neutral-400">Las boletas de este pedido fueron anuladas.</p>
            )}
          </div>
        </div>

        {/* Códigos: solo cuando hay pago confirmado y está verificado */}
        {bannerTone === 'green' && verificado && codigos.length > 0 && (
          <div className="mt-5 border-t border-dashed border-neutral-800 pt-5">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
              Códigos de tus entradas
            </p>
            <div className="flex flex-wrap gap-2">
              {codigos.map((c) => (
                <span
                  key={c}
                  className="rounded-md border border-neutral-800 bg-black/40 px-3 py-1.5 font-mono text-sm font-bold tracking-widest text-[#dc2626]"
                >
                  {c}
                </span>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <ReenviarTodasButton codigos={codigos} />
              <Link
                href="/cuenta/boletas"
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 px-4 py-2 text-sm font-semibold text-neutral-200 transition-colors hover:bg-neutral-800"
              >
                Ver todas mis boletas →
              </Link>
            </div>
          </div>
        )}

        {!verificado && !esPendiente && !esAnulado && (
          <p className="mt-4 text-xs leading-relaxed text-neutral-500">
            Verifica con el correo del pedido (formulario arriba) para ver los códigos de tus entradas.
          </p>
        )}

        <div className="mt-4 flex items-start gap-2 border-t border-neutral-800 pt-4">
          <ShieldCheck size={14} className="mt-0.5 shrink-0 text-neutral-500" />
          <p className="text-[11px] leading-relaxed text-neutral-500">
            Cada boleta es personal e intransferible. En la puerta presenta el código desde tu correo junto con tu documento de identidad. Se escanea una sola vez.
          </p>
        </div>
      </section>

      {/* ================== TITULAR + PAGO (grid) ================== */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Titular */}
        <section className="rounded-xl border border-neutral-800 bg-[#111] p-5 sm:p-6">
          <p className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-[#dc2626]">
            <User size={13} /> Titular
          </p>
          <p className="text-base font-semibold capitalize text-white">{titularMostrado}</p>
          {emailMostrado && (
            <p className="mt-1 truncate text-sm text-neutral-400">{emailMostrado}</p>
          )}
        </section>

        {/* Método de pago */}
        <section className="rounded-xl border border-neutral-800 bg-[#111] p-5 sm:p-6">
          <p className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-[#dc2626]">
            Pago
          </p>
          <div className="flex items-center gap-3">
            {metodo.logo ? (
              <div className="flex h-10 w-16 shrink-0 items-center justify-center rounded-md border border-neutral-800 bg-white p-1.5">
                <Image src={metodo.logo} alt={metodo.nombre} width={56} height={28} unoptimized className="h-full w-full object-contain" />
              </div>
            ) : null}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">{metodo.nombre}</p>
              <p className="truncate text-xs text-neutral-400">{metodo.linea}</p>
            </div>
          </div>
          {referencia && (
            <p className="mt-3 truncate font-mono text-[11px] text-neutral-500">Ref: {referencia}</p>
          )}
        </section>
      </div>

      {/* ================== RESUMEN ================== */}
      <section className="rounded-xl border border-neutral-800 bg-[#111] p-5 sm:p-6">
        <p className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-[#dc2626]">
          Resumen
        </p>
        <div className="space-y-2">
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
        </div>
        <div className="mt-4 flex items-end justify-between border-t border-neutral-800 pt-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Total pagado</span>
          <span className="text-2xl font-black text-white">
            <Price amount={total} />
          </span>
        </div>
      </section>

      {/* ================== CTAS FINALES ================== */}
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/boletas"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#dc2626] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
        >
          <ArrowLeft size={16} />
          Volver a la boletería
        </Link>
        <a
          href={`https://wa.me/573014453392?text=${encodeURIComponent(`Hola, escribo por mi pedido de boletas ${numero}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-700/50 bg-emerald-950/30 px-6 py-3 text-sm font-semibold text-emerald-400 transition-colors hover:bg-emerald-900/40 hover:text-emerald-300"
        >
          <MessageCircle size={16} />
          Hablar por WhatsApp
        </a>
      </div>

      <p className="text-center text-[11px] text-neutral-600">
        Guarda este enlace — también te enviamos los detalles al correo del pedido.
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

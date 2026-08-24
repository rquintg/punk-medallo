'use client'

import Link from 'next/link'
import { CalendarDays, Clock, Download, MapPin, ShieldAlert, ShieldCheck } from 'lucide-react'
import Price from '@/components/tienda/price'
import ReenviarBoletaButton from '@/app/cuenta/boletas/reenviar-boleta-button'

export interface BoletaVista {
  codigo: string
  estado: 'valida' | 'usada' | 'anulada'
  tipoNombre: string
  qrDataUrl: string | null
}

export interface PagoResumenFila {
  titulo: string
  valor: number | null
  gratis?: boolean
}

const ESTADO_BOLETA_CLS: Record<BoletaVista['estado'], string> = {
  valida: 'border-emerald-600/50 bg-emerald-950/30 text-emerald-400',
  usada: 'border-neutral-700 bg-neutral-800 text-neutral-300',
  anulada: 'border-red-900/60 bg-red-950/30 text-red-400',
}

export default function BoletaOrdenView({
  numero,
  fechaStr,
  bannerLabel,
  bannerTone,
  notaAnulado,
  verificado,
  titularMostrado,
  evento,
  boletas,
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
  evento: {
    titulo: string
    fechaStr: string
    lugar: string
    puertas: string | null
    edadMinima: number | null
  } | null
  boletas: BoletaVista[]
  metodo: { nombre: string; logo: string | null; linea: string }
  referencia: string | null
  filasResumen: PagoResumenFila[]
  total: number
}) {
  function descargarTodas() {
    boletas.forEach((b, i) => {
      if (!b.qrDataUrl) return
      setTimeout(() => {
        const a = document.createElement('a')
        a.href = b.qrDataUrl!
        a.download = `${b.codigo}.png`
        a.click()
      }, i * 350)
    })
  }

  const bannerCls =
    bannerTone === 'green'
      ? 'border-emerald-700/50 bg-emerald-950/30 text-emerald-400'
      : bannerTone === 'red'
        ? 'border-red-800/60 bg-red-950/30 text-red-400'
        : 'border-amber-700/50 bg-amber-950/30 text-amber-300'

  return (
    <div className="space-y-6">
      {/* Banner de estado */}
      <div className={`flex items-center gap-3 rounded-xl border px-5 py-4 ${bannerCls}`}>
        {bannerTone === 'green' ? (
          <ShieldCheck size={20} className="shrink-0" />
        ) : (
          <ShieldAlert size={20} className="shrink-0" />
        )}
        <div>
          <p className="font-bold uppercase tracking-wide">{bannerLabel}</p>
          {notaAnulado && (
            <p className="mt-0.5 text-xs opacity-80">{notaAnulado}</p>
          )}
        </div>
      </div>

      {/* Evento */}
      {evento && (
        <div className="rounded-xl border border-neutral-800 bg-[#111] p-5">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.35em] text-[#dc2626]">
            Evento
          </p>
          <h2 className="text-xl font-black uppercase italic tracking-wide text-white">
            {evento.titulo}
          </h2>
          <p className="mt-2 flex items-center gap-2 text-sm capitalize text-neutral-300">
            <CalendarDays size={15} className="shrink-0 text-neutral-500" />
            {evento.fechaStr}
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-neutral-300">
            <MapPin size={15} className="shrink-0 text-neutral-500" />
            {evento.lugar}
          </p>
          {evento.puertas && (
            <p className="mt-1 flex items-center gap-2 text-sm text-neutral-400">
              <Clock size={15} className="shrink-0 text-neutral-500" />
              Puertas: {evento.puertas}
            </p>
          )}
          {evento.edadMinima != null && (
            <span className="mt-2 inline-block rounded-md bg-neutral-900 px-2 py-1 text-xs text-neutral-400">
              Solo mayores de {evento.edadMinima} años
            </span>
          )}
        </div>
      )}

      {/* Boletas */}
      <div className="rounded-xl border border-neutral-800 bg-[#111] p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#dc2626]">
            Tus boletas ({boletas.length})
          </p>
          {verificado && boletas.length > 1 && (
            <button
              type="button"
              onClick={descargarTodas}
              className="inline-flex items-center gap-1.5 rounded-md border border-neutral-700 px-3 py-1.5 text-xs font-semibold text-neutral-300 transition-colors hover:bg-neutral-800"
            >
              <Download size={13} />
              Descargar todas
            </button>
          )}
        </div>

        {!verificado ? (
          <p className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/60 p-4 text-sm text-neutral-400">
            <ShieldAlert size={18} className="shrink-0 text-amber-400" />
            Los QR están ocultos hasta verificar tu correo (formulario arriba).
          </p>
        ) : (
          <div className="space-y-4">
            {boletas.map((b) => (
              <article key={b.codigo} className="flex gap-4 rounded-lg border border-neutral-800 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {b.qrDataUrl && (
                  <img src={b.qrDataUrl} alt={`QR ${b.codigo}`} width={110} height={110}
                    className={`h-[110px] w-[110px] shrink-0 rounded-lg ${b.estado !== 'valida' ? 'opacity-40 grayscale' : ''}`} />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-mono text-sm font-bold tracking-widest text-[#ff4444]">{b.codigo}</p>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${ESTADO_BOLETA_CLS[b.estado]}`}>
                      {b.estado === 'valida' ? 'Válida' : b.estado === 'usada' ? 'Usada' : 'Anulada'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-300">{b.tipoNombre}</p>

                  {b.estado === 'valida' ? (
                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      {b.qrDataUrl && (
                        <a href={b.qrDataUrl} download={`${b.codigo}.png`}
                          className="inline-flex items-center gap-1.5 rounded-md border border-neutral-700 px-3 py-1.5 text-xs font-semibold text-neutral-300 transition-colors hover:bg-neutral-800">
                          <Download size={12} /> Descargar QR
                        </a>
                      )}
                      <ReenviarBoletaButton codigo={b.codigo} />
                    </div>
                  ) : b.estado === 'usada' ? (
                    <p className="mt-2 text-xs text-neutral-500">Esta boleta ya fue escaneada en la puerta.</p>
                  ) : (
                    <p className="mt-2 text-xs text-red-400">Boleta anulada junto con el pedido.</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        <Link
          href="/cuenta/boletas"
          className="mt-4 inline-block text-xs font-medium text-[var(--admin-accent,#dc2626)] hover:underline"
        >
          Ver todas mis boletas →
        </Link>
      </div>

      {/* Pago */}
      <div className="rounded-xl border border-neutral-800 bg-[#111] p-5">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.35em] text-[#dc2626]">Pago</p>
        {metodo.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={metodo.logo} alt={metodo.nombre} className="mb-3 h-10 w-auto" />
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
      </div>

      {/* Número de pedido pie */}
      <p className="text-center text-xs text-neutral-600">
        Pedido <span className="font-mono text-neutral-400">{numero}</span> · {fechaStr}
      </p>
    </div>
  )
}

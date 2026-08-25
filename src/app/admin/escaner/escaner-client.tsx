'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Camera, CameraOff, Keyboard, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

interface ResultadoValidacion {
  ok: boolean
  status:
    | 'valida'
    | 'ya_usada'
    | 'anulada'
    | 'no_encontrada'
    | 'firma_invalida'
    | 'formato_invalido'
    | 'otro_evento'
  mensaje: string
  titular?: string
  email?: string
  codigo?: string
}

interface EventoEscaner {
  id: string
  titulo: string
  fechaStr: string
}

type EstadoCamara = 'apagada' | 'iniciando' | 'activa' | 'pausa' | 'error'

const CONTAINER_ID = 'qr-reader-lib'

export default function EscanerClient({ eventos }: { eventos: EventoEscaner[] }) {
  const [selectedEventoId, setSelectedEventoId] = useState<string>('')
  const [estado, setEstado] = useState<EstadoCamara>('apagada')
  const [resultado, setResultado] = useState<ResultadoValidacion | null>(null)
  const [contadorOk, setContadorOk] = useState(0)
  const [manual, setManual] = useState('')
  const [manualPending, setManualPending] = useState(false)

  const scannerRef = useRef<any>(null)
  const selectedRef = useRef('')
  const estadoRef = useRef<EstadoCamara>('apagada')
  const ultimoPayloadRef = useRef<{ payload: string; ts: number }>({ payload: '', ts: 0 })

  // Espejos para que el callback registrado por html5-qrcode lea siempre el valor actual
  useEffect(() => {
    selectedRef.current = selectedEventoId
    estadoRef.current = estado
  }, [selectedEventoId, estado])

  // Persistir último evento seleccionado (localStorage)
  useEffect(() => {
    if (eventos.length === 0) return
    const guardado = localStorage.getItem('pm_escaner_evento')
    const valido = eventos.some((e) => e.id === guardado)
    const inicial = valido ? guardado! : eventos[0].id
    setSelectedEventoId(inicial)
    selectedRef.current = inicial
  }, [eventos])

  /** Secuencia de parada blindada — nunca lanza */
  async function detenerInterno() {
    const s = scannerRef.current
    if (!s) return
    try {
      await s.stop()
    } catch {}
    try {
      s.clear()
    } catch {}
    scannerRef.current = null
  }

  async function validar(payload: string) {
    const eventoId = selectedRef.current
    if (!eventoId) {
      setResultado({
        ok: false,
        status: 'formato_invalido',
        mensaje: 'Selecciona el evento primero',
      })
      return
    }

    try {
      const res = await fetch('/api/boletas/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload, eventoId }),
      })
      const data: ResultadoValidacion = await res.json()
      setResultado(data)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(data.ok ? 120 : [80, 60, 80])
      }
    } catch {
      setResultado({
        ok: false,
        status: 'formato_invalido',
        mensaje: 'Error de conexión — reintenta',
      })
    }
  }

  function siguiente() {
    setResultado(null)
    ultimoPayloadRef.current = { payload: '', ts: 0 }
    if (estadoRef.current === 'pausa' && scannerRef.current) {
      try {
        scannerRef.current.resume()
        setEstado('activa')
      } catch {}
    }
  }

  /** Callback registrado UNA vez al iniciar la cámara — usa refs, no closures */
  const onScanSuccess = useCallback(
    (decodedText: string) => {
      try {
        // Pausa INMEDIATA al detectar cualquier QR — antes de la validación async.
        // Sin esto, la cámara sigue viva durante el fetch y recaptura el mismo
        // QR en <1s → falso "ya usada" sobre el resultado verde.
        if (scannerRef.current && estadoRef.current === 'activa') {
          scannerRef.current.pause(true)
          estadoRef.current = 'pausa'
          setEstado('pausa')
        }
        void validar(decodedText)
      } catch (e) {
        console.error('[Escaner] error en validación:', e)
      }
    },
    [],
  )
  // eslint-disable-next-line react-hooks/exhaustive-deps

  async function iniciar() {
    if (!selectedRef.current) return
    setEstado('iniciando')
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const scanner = new Html5Qrcode(CONTAINER_ID)
      scannerRef.current = scanner
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        onScanSuccess,
        () => {},
      )
      setEstado('activa')
    } catch (e: any) {
      console.error('[Escaner] error iniciando:', e?.message)
      await detenerInterno()
      setEstado('error')
      toast.error(
        e?.message?.includes('Permission')
          ? 'Permiso de cámara denegado — actívalo en el navegador'
          : 'No se pudo iniciar la cámara',
      )
    }
  }

  async function detener() {
    await detenerInterno()
    setEstado('apagada')
    setResultado(null)
  }

  useEffect(() => {
    return () => {
      void detenerInterno()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleManualSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const code = manual.trim().toUpperCase()
    if (!code.startsWith('PM-TKT-')) {
      setResultado({ ok: false, status: 'formato_invalido', mensaje: 'Formato: PM-TKT-XXXXXX' })
      return
    }
    void validar(code)
    setManual('')
  }

  const camaraActiva = estado === 'activa' || estado === 'pausa'
  const bordeResultado = resultado?.ok ? 'border-emerald-500 bg-emerald-950/40' : 'border-red-600 bg-red-950/40'
  const textoResultado = resultado?.ok ? 'text-emerald-400' : 'text-red-400'

  return (
    <div className="space-y-6">
      {/* Selector de evento */}
      <div className="card-section space-y-3">
        <h3 className="admin-section-title">Evento</h3>
        {eventos.length === 0 ? (
          <p className="rounded-lg border border-amber-700/50 bg-amber-950/20 px-4 py-3 text-sm text-amber-300">
            No hay eventos activos. Crea uno en Boletería → Eventos.
          </p>
        ) : (
          <>
            <select
              value={selectedEventoId}
              onChange={(e) => setSelectedEventoId(e.target.value)}
              disabled={camaraActiva}
              className="w-full rounded-md border border-[var(--admin-card-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-text)] outline-none focus:border-[var(--admin-accent)] disabled:opacity-60"
              aria-label="Evento a escanear"
            >
              {eventos.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.titulo} · {e.fechaStr}
                </option>
              ))}
            </select>
            {camaraActiva && (
              <p className="text-[11px] text-[var(--admin-text-dim)]">
                Detén la cámara para cambiar de evento.
              </p>
            )}
          </>
        )}
      </div>

      {/* Cámara */}
      <div className="card-section space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="admin-section-title">Cámara</h3>
          {contadorOk > 0 && (
            <span className="rounded-full border border-emerald-600/50 bg-emerald-950/30 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
              ✓ {contadorOk} escaneadas
            </span>
          )}
        </div>

        {/* Contenedor exclusivo de html5-qrcode — React jamás pone hijos aquí */}
        <div className="relative">
          <div id={CONTAINER_ID} style={{ minHeight: 200 }} />

          {/* Overlay hermano: placeholder cuando la cámara está apagada */}
          {(estado === 'apagada' || estado === 'error') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <button
                type="button"
                onClick={iniciar}
                disabled={!selectedRef.current}
                className="flex h-[280px] w-full flex-col items-center justify-center gap-3 text-[var(--admin-text-muted)] transition-colors hover:text-[var(--admin-text)] disabled:opacity-50"
              >
                <Camera size={44} />
                <span className="text-sm font-medium">
                  {!selectedEventoId
                    ? 'Selecciona un evento'
                    : estado === 'error'
                      ? 'Error de cámara — reintentar'
                      : 'Iniciar cámara'}
                </span>
              </button>
            </div>
          )}
        </div>

        {camaraActiva && (
          <button
            type="button"
            onClick={() => void detener()}
            className="inline-flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-red-400"
          >
            <CameraOff size={14} /> Detener cámara
          </button>
        )}
      </div>

      {/* Resultado grande */}
      {resultado && (
        <div className={`animate-pm-fade-in rounded-xl border-2 p-6 text-center ${bordeResultado}`}>
          <p className={`text-4xl ${textoResultado}`}>{resultado.ok ? '✓' : '✗'}</p>
          <p className={`mt-1 text-lg font-black uppercase tracking-wide ${textoResultado}`}>
            {resultado.ok ? 'Entrada válida' : 'Rechazada'}
          </p>
          {resultado.titular && (
            <p className="mt-2 text-base font-bold text-white">{resultado.titular}</p>
          )}
          {resultado.email && <p className="text-xs text-neutral-400">{resultado.email}</p>}
          {!resultado.ok && (
            <p className={`mt-1 text-sm ${textoResultado}`}>{resultado.mensaje}</p>
          )}
          {resultado.codigo && (
            <p className="mt-2 font-mono text-xs text-neutral-500">{resultado.codigo}</p>
          )}

          {estado === 'pausa' ? (
            <button
              type="button"
              onClick={siguiente}
              className="mt-4 w-full rounded-lg bg-[var(--admin-accent)] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
            >
              Escanear siguiente
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setResultado(null)}
              className="mx-auto mt-4 flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300"
            >
              <RotateCcw size={12} /> Limpiar resultado
            </button>
          )}
        </div>
      )}

      {/* Manual fallback */}
      <div className="card-section space-y-3">
        <h3 className="admin-section-title flex items-center gap-2">
          <Keyboard size={16} /> Código manual
        </h3>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value.toUpperCase())}
            placeholder="PM-TKT-XXXXXX"
            maxLength={13}
            disabled={manualPending}
            className="w-full rounded-md border border-[var(--admin-card-border)] bg-[var(--admin-input-bg)] px-3 py-2 font-mono text-sm uppercase text-[var(--admin-text)] outline-none focus:border-[var(--admin-accent)]"
          />
          <button
            type="submit"
            disabled={manualPending || !manual}
            className="shrink-0 rounded-md bg-[var(--admin-accent)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Validar
          </button>
        </form>
        <p className="text-[11px] text-[var(--admin-text-dim)]">
          Fallback si el QR está dañado. El código aparece en la boleta y en el correo.
        </p>
      </div>
    </div>
  )
}

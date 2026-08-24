'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Camera, CameraOff, Keyboard, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

interface ResultadoValidacion {
  ok: boolean
  status: 'valida' | 'ya_usada' | 'anulada' | 'no_encontrada' | 'firma_invalida' | 'formato_invalido'
  mensaje: string
  titular?: string
  email?: string
  codigo?: string
}

type EstadoCamara = 'apagada' | 'iniciando' | 'activa' | 'error'

const COOLDOWN_MS = 3000

export default function EscanerClient() {
  const [estado, setEstado] = useState<EstadoCamara>('apagada')
  const [resultado, setResultado] = useState<ResultadoValidacion | null>(null)
  const [contadorOk, setContadorOk] = useState(0)
  const [manual, setManual] = useState('')
  const [manualPending, setManualPending] = useState(false)

  const scannerRef = useRef<any>(null)
  const divIdRef = useRef('qr-reader')
  const ultimoPayloadRef = useRef<{ payload: string; ts: number }>({ payload: '', ts: 0 })

  async function validar(payload: string) {
    // Debounce: mismo QR dentro del cooldown se ignora (evita doble envío)
    const ahora = Date.now()
    if (
      payload === ultimoPayloadRef.current.payload &&
      ahora - ultimoPayloadRef.current.ts < COOLDOWN_MS
    ) {
      return
    }
    ultimoPayloadRef.current = { payload, ts: ahora }

    try {
      const res = await fetch('/api/boletas/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload }),
      })
      const data: ResultadoValidacion = await res.json()
      setResultado(data)
      if (data.ok && data.status === 'valida') {
        setContadorOk((c) => c + 1)
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(120)
      } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([80, 60, 80])
      }
    } catch {
      setResultado({
        ok: false,
        status: 'formato_invalido',
        mensaje: 'Error de conexión — reintenta',
      })
    }
  }

  const onScanSuccess = useCallback(
    (decodedText: string) => void validar(decodedText),
    [],
  )

  async function iniciar() {
    setEstado('iniciando')
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const scanner = new Html5Qrcode(divIdRef.current)
      scannerRef.current = scanner
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => onScanSuccess(decodedText),
        () => {}, // errores por-frame (sin QR a la vista) se ignoran
      )
      setEstado('activa')
    } catch (e: any) {
      console.error(e?.message)
      setEstado('error')
      toast.error(e?.message?.includes('Permission')
        ? 'Permiso de cámara denegado — actívalo en el navegador'
        : 'No se pudo iniciar la cámara')
    }
  }

  async function detener() {
    try {
      await scannerRef.current?.stop()
      scannerRef.current?.clear()
    } catch {}
    scannerRef.current = null
    setEstado('apagada')
  }

  useEffect(() => {
    return () => {
      scannerRef.current?.stop().catch(() => {})
      scannerRef.current?.clear().catch(() => {})
    }
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

  const bordeResultado = resultado?.ok ? 'border-emerald-500 bg-emerald-950/40' : 'border-red-600 bg-red-950/40'
  const textoResultado = resultado?.ok ? 'text-emerald-400' : 'text-red-400'

  return (
    <div className="space-y-6">
      {/* Cámara */}
      <div className="card-section space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="admin-section-title">Cámara</h3>
          {estado === 'activa' && contadorOk > 0 && (
            <span className="rounded-full border border-emerald-600/50 bg-emerald-950/30 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
              ✓ {contadorOk} escaneadas
            </span>
          )}
        </div>

        <div id={divIdRef.current} className="mx-auto w-full overflow-hidden rounded-lg border border-[var(--admin-card-border)] [&>video]:w-full" style={{ minHeight: 200 }}>
          {estado !== 'activa' && estado !== 'iniciando' ? (
            <button
              type="button"
              onClick={iniciar}
              className="flex h-[280px] w-full flex-col items-center justify-center gap-3 text-[var(--admin-text-muted)] transition-colors hover:text-[var(--admin-text)] disabled:opacity-50"
            >
              <Camera size={44} />
              <span className="text-sm font-medium">
                {estado === 'error' ? 'Error de cámara — reintentar' : 'Iniciar cámara'}
              </span>
            </button>
          ) : (
            <div className="flex h-[280px] w-full items-center justify-center text-sm text-[var(--admin-text-dim)]">
              Iniciando cámara...
            </div>
          )}
        </div>

        {estado === 'activa' && (
          <button type="button" onClick={detener} className="inline-flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-red-400">
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

      {/* Reset resultado */}
      {resultado && (
        <button
          type="button"
          onClick={() => setResultado(null)}
          className="mx-auto flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300"
        >
          <RotateCcw size={12} /> Limpiar resultado
        </button>
      )}
    </div>
  )
}

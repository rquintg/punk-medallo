import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { verifyCsrf } from '@/lib/csrf'
import { getRateLimitKey, checkRateLimit } from '@/lib/rate-limit'
import { logger, generateRequestId } from '@/lib/logger'
import { validarCupon } from '@/features/cupones/services/cupones'
import { normalizarCodigo } from '@/features/cupones/calculo'
import { motivoRechazoTexto } from '@/features/cupones/types'
import { sanitizeText } from '@/lib/sanitize'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface CuponValidarRequest {
  codigo: string
  email: string
  subtotal: number
}

export async function POST(request: NextRequest) {
  const rid = generateRequestId()
  const cookieChanges: { name: string; value: string; options: Record<string, unknown> }[] = []
  const start = Date.now()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieChanges.push({ name, value, options: options as Record<string, unknown> })
          })
        },
      },
    },
  )

  function respond(data: unknown, init?: ResponseInit) {
    const res = NextResponse.json(data, init)
    cookieChanges.forEach(({ name, value, options }) => {
      res.cookies.set(name, value, options as Parameters<typeof res.cookies.set>[2])
    })
    return res
  }

  try {
    if (!verifyCsrf(request)) {
      return respond({ error: 'Origen no autorizado' }, { status: 403 })
    }

    const rl = checkRateLimit(getRateLimitKey(request))
    if (!rl.allowed) {
      return respond(
        { error: 'Demasiadas solicitudes. Intentá de nuevo en un minuto.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetTime - Date.now()) / 1000)) } },
      )
    }

    const body: CuponValidarRequest = await request.json()
    const codigo = normalizarCodigo(sanitizeText(String(body.codigo ?? '')))
    const email = sanitizeText(String(body.email ?? '')).toLowerCase()
    const subtotal = Math.max(0, Number(body.subtotal) || 0)

    if (!codigo || !EMAIL_RE.test(email)) {
      return respond({ error: 'Código de cupón y correo requeridos' }, { status: 400 })
    }

    const resultado = await validarCupon(supabase, codigo, email, subtotal)

    logger.info('Cupón validado', {
      requestId: rid,
      duration: Date.now() - start,
      data: { codigo, valido: resultado.valido, motivo: resultado.motivo },
    })

    return respond({
      valido: resultado.valido,
      motivo: resultado.motivo,
      mensaje: resultado.motivo ? motivoRechazoTexto(resultado.motivo) : undefined,
      descuento: resultado.descuento,
      minimo: resultado.minimo,
      cupon: resultado.cupon,
    })
  } catch (err) {
    logger.error('Error validando cupón', { requestId: rid, error: err })
    return respond({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { parseQrPayload, verificarFirmaBoleta } from '@/lib/ticket-crypto'
import { getRateLimitKey, checkRateLimit } from '@/lib/rate-limit'
import { can } from '@/features/admin/utils/permissions'
import { getSupabaseAdmin } from '@/features/admin/services/supabase-admin'

export const runtime = 'nodejs'

function getSupabase(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const c of cookiesToSet) {
            request.cookies.set(c)
          }
          response = NextResponse.next({ request })
          for (const c of cookiesToSet) {
            response.cookies.set(c)
          }
        },
      },
    },
  )

  return { supabase, response }
}

export async function POST(request: NextRequest) {
  // Auth + permiso manage_boleteria (admin/super_admin)
  const { supabase, response } = getSupabase(request)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { data: perfil } = await (supabase.from('perfiles') as any)
    .select('rol')
    .eq('id', user.id)
    .single()

  if (!can(perfil?.rol ?? '', 'manage_boleteria')) {
    return NextResponse.json({ error: 'Sin permisos para validar boletas' }, { status: 403 })
  }

  // Rate limit (defensa extra contra fuerza bruta de códigos)
  const rl = checkRateLimit(getRateLimitKey(request))
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Demasiadas solicitudes' }, { status: 429 })
  }

  // Payload: QR escaneado (`codigo|firma`) o código manual
  let raw = ''
  try {
    const body = await request.json()
    raw = String(body?.payload ?? '').trim()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }
  if (!raw) return NextResponse.json({ error: 'Payload vacío' }, { status: 400 })

  const parsed = parseQrPayload(raw)
  const codigo = parsed?.codigo ?? (raw.startsWith('PM-TKT-') ? raw : '')

  if (!/^PM-TKT-[A-Z0-9]{6}$/.test(codigo)) {
    return NextResponse.json({ ok: false, status: 'formato_invalido', mensaje: 'Código no válido' })
  }
  if (parsed && !verificarFirmaBoleta(parsed.codigo, parsed.firma)) {
    loggerWarn('firma inválida', codigo)
    return NextResponse.json({ ok: false, status: 'firma_invalida', mensaje: 'QR alterado o falso' })
  }

  const admin = getSupabaseAdmin()

  // Validación ATÓMICA: solo gana el UPDATE si sigue 'valida'.
  const { data: usada, error: updateError } = await (admin.from('boletas') as any)
    .update({ estado: 'usada', escaneada_en: new Date().toISOString(), escaneada_por: user.id })
    .eq('codigo', codigo)
    .eq('estado', 'valida')
    .select('titular_nombre, titular_email')
    .maybeSingle()

  if (updateError) {
    console.error('BoletasValidar: error update:', updateError.message)
    return NextResponse.json({ error: 'Error validando' }, { status: 500 })
  }

  if (usada) {
    return NextResponse.json({
      ok: true,
      status: 'valida',
      mensaje: 'Entrada válida',
      titular: usada.titular_nombre,
      email: usada.titular_email,
      codigo,
    })
  }

  // No estaba 'valida': reportar por qué
  const { data: actual } = await (admin.from('boletas') as any)
    .select('estado, escaneada_en, titular_nombre')
    .eq('codigo', codigo)
    .maybeSingle()

  if (!actual) {
    return NextResponse.json({ ok: false, status: 'no_encontrada', mensaje: 'Boleta no existe' })
  }

  if (actual.estado === 'usada') {
    const cuando = actual.escaneada_en
      ? new Date(actual.escaneada_en).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'medium' })
      : ''
    return NextResponse.json({
      ok: false,
      status: 'ya_usada',
      mensaje: `Ya fue usada${cuando ? ` el ${cuando}` : ''}`,
      titular: actual.titular_nombre,
      codigo,
    })
  }

  return NextResponse.json({
    ok: false,
    status: 'anulada',
    mensaje: 'Boleta anulada',
    titular: actual.titular_nombre,
    codigo,
  })
}

function loggerWarn(msg: string, codigo: string) {
  console.warn(`BoletasValidar: ${msg} (${codigo})`)
}

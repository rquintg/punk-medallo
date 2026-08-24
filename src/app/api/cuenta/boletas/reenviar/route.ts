import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRateLimitKey, checkRateLimit } from '@/lib/rate-limit'
import { reenviarTicketEmail } from '@/lib/email'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  // Rate limit por IP (el ownership se valida contra la sesión)
  const rl = checkRateLimit(getRateLimitKey(request))
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Espera un minuto.' },
      { status: 429 },
    )
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user?.email) {
    return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
  }

  let codigo = ''
  try {
    const body = await request.json()
    codigo = String(body?.codigo ?? '').trim()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  if (!/^PM-TKT-[A-Z0-9]{6}$/.test(codigo)) {
    return NextResponse.json({ error: 'Código inválido' }, { status: 400 })
  }

  // Ownership: RLS de boletas solo deja leer las propias; si no devuelve fila,
  // el usuario está intentando reenviar una ajena.
  const { data: propia, error: ownError } = await (supabase.from('boletas') as any)
    .select('id')
    .eq('codigo', codigo)
    .eq('titular_email', user.email)
    .maybeSingle()

  if (ownError) {
    return NextResponse.json({ error: 'Error verificando la boleta' }, { status: 500 })
  }
  if (!propia) {
    return NextResponse.json({ error: 'Esta boleta no pertenece a tu cuenta' }, { status: 403 })
  }

  const resultado = await reenviarTicketEmail(codigo, user.email)
  if (!resultado.ok) {
    return NextResponse.json({ error: resultado.error ?? 'Error al reenviar' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

let adminClient: ReturnType<typeof createClient> | null = null

function getSupabaseAdmin() {
  if (!adminClient) {
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } },
    )
  }
  return adminClient!
}

const EMAIL_RE = /^\S+@\S+\.\S+$/

export async function POST(request: NextRequest) {
  let body: { producto_id?: string; email?: string; telefono?: string | null; talla?: string | null; color?: string | null }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const productoId = (body.producto_id ?? '').trim()
  const email = (body.email ?? '').trim().toLowerCase()
  const telefono = (body.telefono ?? '').trim().replace(/[\s-]/g, '') || null
  const talla = (body.talla ?? '').trim() || null
  const color = (body.color ?? '').trim() || null

  if (!productoId || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  if (telefono && !/^\+?[0-9]{7,15}$/.test(telefono)) {
    return NextResponse.json({ error: 'Teléfono inválido' }, { status: 400 })
  }

  // Solo permitir avisos de productos activos existentes
  const { data: producto, error: productoError } = await (getSupabaseAdmin()
    .from('productos')
    .select('id, activo, slug')
    .eq('id', productoId)
    .maybeSingle() as any)

  if (productoError || !producto || !producto.activo) {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
  }

  // Insert directo: el índice único funcional (producto_id, email, talla, color)
  // permite varias combinaciones por email pero bloquea duplicados exactos.
  // Un 23505 (unique violation) significa que esa persona ya registró esa misma
  // combinación — respuesta idempotente sin crear fila duplicada.
  const { error: insertError } = await (getSupabaseAdmin().from('avisos_stock') as any).insert(
    { producto_id: productoId, email, telefono, talla, color },
  )

  if (insertError) {
    if (insertError.code === '23505') {
      return NextResponse.json({ ok: true, yaRegistrado: true }, { status: 200 })
    }
    console.error('insert aviso_stock error:', insertError)
    return NextResponse.json({ error: 'Error guardando el aviso' }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
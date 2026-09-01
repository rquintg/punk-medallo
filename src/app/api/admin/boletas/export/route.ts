import { NextResponse, type NextRequest } from 'next/server'
import { getRolActual } from '@/features/admin/utils/auth-server'
import { can } from '@/features/admin/utils/permissions'
import { getSupabaseAdmin } from '@/features/admin/services/supabase-admin'

export const dynamic = 'force-dynamic'

function csvEscape(v: string | null | undefined): string {
  const s = v ?? ''
  if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) return `"${s.replace(/"/g, '""')}"`
  return s
}

function fmtBogota(iso: string | null): string {
  if (!iso) return ''
  try {
    return new Intl.DateTimeFormat('es-CO', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date(iso))
  } catch {
    return iso ?? ''
  }
}

export async function GET(request: NextRequest) {
  const rol = await getRolActual()
  if (!can(rol, 'manage_boleteria')) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const eventoId = request.nextUrl.searchParams.get('eventoId')?.trim() ?? ''
  if (!/^[0-9a-f-]{36}$/i.test(eventoId)) return NextResponse.json({ error: 'eventoId requerido' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  if (rol === 'publicador') {
    const { getUsuarioActual } = await import('@/features/admin/utils/auth-server')
    const usuario = await getUsuarioActual()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client sin Database generic (patrón tienda: as unknown as)
    const { data: evOwner } = await (supabase.from('eventos_boletos') as any).select('owner_id').eq('id', eventoId).maybeSingle()
    if (!evOwner || (evOwner as { owner_id: string | null }).owner_id !== usuario?.id) {
      return NextResponse.json({ error: 'No autorizado para este evento' }, { status: 403 })
    }
  }

  // evento info para filename
  const { data: evento } = await (supabase.from('eventos_boletos') as any).select('titulo, fecha_evento').eq('id', eventoId).maybeSingle()
  const tituloSlug = (evento?.titulo ?? eventoId).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)

  // tipos map
  const { data: tipos } = await (supabase.from('tipos_boleta') as any).select('id, nombre').eq('evento_id', eventoId)
  const tipoMap = new Map<string, string>()
  for (const t of (tipos ?? []) as Array<{ id: string; nombre: string }>) tipoMap.set(t.id, t.nombre)

  // fetch all boletas del evento (incluye anuladas) — pagina en batches de 1000 para evitar truncamiento
  const all: Array<{
    codigo: string
    estado: string
    tipo_id: string
    titular_nombre: string
    titular_email: string
    created_at: string
    escaneada_en: string | null
    escaneada_por: string | null
    pedidos: { numero_pedido: string } | null
  }> = []
  let from = 0
  const batch = 1000
  for (;;) {
    const { data } = await (supabase.from('boletas') as any)
      .select('codigo, estado, tipo_id, titular_nombre, titular_email, created_at, escaneada_en, escaneada_por, pedidos(numero_pedido)')
      .eq('evento_id', eventoId)
      .order('created_at', { ascending: false })
      .range(from, from + batch - 1)
    const rows = (data ?? []) as typeof all
    all.push(...rows)
    if (rows.length < batch) break
    from += batch
    if (all.length > 50000) break
  }

  // mapeo scanner emails
  const scannerIds = [...new Set(all.map((r) => r.escaneada_por).filter(Boolean) as string[])]
  const emailMap = new Map<string, string>()
  if (scannerIds.length > 0) {
    try {
      const { data: auth } = await supabase.auth.admin.listUsers({ page: 1, perPage: 10000 })
      for (const u of auth?.users ?? []) if (scannerIds.includes(u.id)) emailMap.set(u.id, u.email ?? '')
    } catch {}
  }

  const header = ['codigo', 'estado', 'tipo', 'titular_nombre', 'titular_email', 'numero_pedido', 'comprada_en_Bogota', 'escaneada_en_Bogota', 'escaneada_por'].join(',')
  const lines = all.map((r) =>
    [
      csvEscape(r.codigo),
      csvEscape(r.estado),
      csvEscape(tipoMap.get(r.tipo_id) ?? r.tipo_id),
      csvEscape(r.titular_nombre),
      csvEscape(r.titular_email),
      csvEscape(r.pedidos?.numero_pedido ?? ''),
      csvEscape(fmtBogota(r.created_at)),
      csvEscape(fmtBogota(r.escaneada_en)),
      csvEscape(r.escaneada_por ? (emailMap.get(r.escaneada_por) ?? r.escaneada_por) : ''),
    ].join(','),
  )

  const csv = '\uFEFF' + [header, ...lines].join('\n')
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="boletas-${tituloSlug}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}

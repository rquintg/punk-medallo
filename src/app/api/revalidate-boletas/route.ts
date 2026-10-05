import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: Request) {
  const secret = new URL(request.url).searchParams.get('secret')
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  revalidatePath('/boletas', 'layout')
  revalidatePath('/boletas', 'page')
  revalidatePath('/sitemap.xml', 'page')
  // revalida cada slug (best-effort)
  try {
    const { listarEventosActivos } = await import('@/features/boletas/services/public')
    const eventos = await listarEventosActivos()
    for (const e of eventos) {
      revalidatePath(`/boletas/${e.slug}`, 'page')
    }
  } catch {}
  return NextResponse.json({ ok: true, revalidated: true })
}

import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

// Cron externo (cron-job.org): solo el sitemap es estático.
// /boletas y /boletas/[slug] son dinámicos (searchParams/cookies) y siempre leen fresco.
export async function POST(request: Request) {
  const secret = new URL(request.url).searchParams.get('secret')
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  revalidatePath('/sitemap.xml', 'page')
  return NextResponse.json({ ok: true, revalidated: true })
}

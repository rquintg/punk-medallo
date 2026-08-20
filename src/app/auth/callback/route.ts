import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { DEFAULT_AUTH_REDIRECT } from '@/lib/constants'
import { safeRedirect } from '@/lib/safe-redirect'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = safeRedirect(searchParams.get('next'), DEFAULT_AUTH_REDIRECT)

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=invalid_link', request.url))
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(new URL('/login?error=verification_failed', request.url))
  }

  return NextResponse.redirect(new URL(next, request.url))
}
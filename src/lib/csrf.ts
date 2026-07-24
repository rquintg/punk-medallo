import { type NextRequest } from 'next/server'

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://punkmedallo.com',
  'https://www.punkmedallo.com',
]

export function verifyCsrf(request: NextRequest): boolean {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    return true
  }

  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const requestOrigin = origin || referer

  if (!requestOrigin) return false

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const origins = siteUrl ? [...ALLOWED_ORIGINS, siteUrl] : ALLOWED_ORIGINS

  return origins.some((allowed) => requestOrigin.startsWith(allowed))
}

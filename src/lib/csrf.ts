import { type NextRequest } from 'next/server'

export function verifyCsrf(request: NextRequest): boolean {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    return true
  }

  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const requestOrigin = origin || referer

  if (!requestOrigin) return false

  const host = request.headers.get('host')
  if (!host) return false

  try {
    const originUrl = new URL(requestOrigin)
    return originUrl.host === host
  } catch {
    return false
  }
}

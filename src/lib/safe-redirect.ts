export function safeRedirect(to: string | null | undefined, fallback: string): string {
  if (!to) return fallback
  if (to.startsWith('//') || to.startsWith('/\\')) return fallback
  if (!to.startsWith('/')) return fallback
  if (/[\r\n]/.test(to)) return fallback
  return to
}
export function formatBogota(iso: string, opts: Intl.DateTimeFormatOptions = {}): string {
  return new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota', ...opts }).format(new Date(iso))
}

export function formatBogotaFechaCorta(iso: string): string {
  return formatBogota(iso, { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
}

export function formatBogotaFechaSolo(iso: string): string {
  const s = formatBogota(iso, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

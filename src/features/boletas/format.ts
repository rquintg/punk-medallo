/** Formato solo dia/mes/anio para boletas (sin hora). fecha_evento es timestamptz. */
export function formatearFechaBoleta(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const s = d.toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  // Capitaliza primera letra (es-CO devuelve minuscula)
  return s.charAt(0).toUpperCase() + s.slice(1)
}

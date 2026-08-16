// URL base del sitio para enlaces en emails y notificaciones.
// Nunca devuelve localhost/servidores de dev: en desarrollo local (donde
// NEXT_PUBLIC_SITE_URL suele apuntar a http://localhost:3000) los emails
// siempre enlazan al sitio real. El checkout NO usa este helper (a propósito,
// su lógica isLocal depende del valor crudo de la env).
export function sitioUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL
  if (env && !env.includes('localhost') && !env.startsWith('http://127.')) return env
  return 'https://punkmedallo.com'
}
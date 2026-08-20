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

// URL de retorno del flujo de confirmación de correo (signup PKCE).
// En desarrollo SIEMPRE apunta a localhost:3000 (el code_verifier de PKCE vive
// en la cookie del origin que inició el registro — si el email llevara a otro
// dominio, el intercambio del code fallaría). En producción usa la env cruda.
export function authRedirectUrl(): string {
  if (process.env.NODE_ENV === 'development') return 'http://localhost:3000/auth/callback'
  const env = process.env.NEXT_PUBLIC_SITE_URL
  const base = env && !env.includes('localhost') ? env : 'https://punkmedallo.com'
  return `${base.replace(/\/+$/, '')}/auth/callback`
}
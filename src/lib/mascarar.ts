export function mascararTelefono(telefono: string | null | undefined): string | null {
  if (!telefono) return null
  const t = telefono.trim().replace(/\s+/g, '')
  if (t.length <= 4) return '*'.repeat(t.length)
  const keep = Math.min(3, t.length - 4)
  return `${t.slice(0, keep)}***${t.slice(-4)}`
}

export function mascararDireccion(direccion: string | null | undefined): string | null {
  if (!direccion) return null
  if (direccion.length <= 6) return '*'.repeat(direccion.length)
  return `${direccion.slice(0, 6)}*****`
}

export function mascararEmail(email: string | null | undefined): string | null {
  if (!email) return null
  const [localPart, ...rest] = email.split('@')
  if (rest.length === 0) return '*'.repeat(email.length)
  const domain = rest.join('@')
  if (!localPart) return `***@${domain}`
  const keep = Math.min(3, localPart.length - 1)
  return `${localPart.slice(0, keep)}***@${domain}`
}

export function mascararNombre(nombre: string | null | undefined): string | null {
  if (!nombre) return null
  const palabras = nombre.trim().split(/\s+/)
  if (palabras.length === 1) {
    const w = palabras[0]
    if (w.length <= 2) return `${w[0] ?? ''}***`
    return `${w.slice(0, 2)}***`
  }
  const resto = palabras.slice(1).map((p) => p[0] ?? '').join('. ')
  return `${palabras[0]} ${resto}***`
}

export function mascararReferencia(ref: string | null | undefined): string | null {
  if (!ref) return null
  const r = ref.trim()
  if (r.length <= 6) return '***' + r
  return `***${r.slice(-6)}`
}
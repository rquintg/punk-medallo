export function sanitizeText(value: string): string {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .trim()
}

export function sanitizeShipping(shipping: {
  nombre: string
  email: string
  telefono: string
  direccion: string
  departamento: string
  ciudad: string
  barrio: string
  notas: string
}) {
  return {
    nombre: sanitizeText(shipping.nombre),
    email: shipping.email.trim().toLowerCase(),
    telefono: shipping.telefono.replace(/\D/g, '').slice(0, 10),
    direccion: sanitizeText(shipping.direccion),
    departamento: sanitizeText(shipping.departamento),
    ciudad: sanitizeText(shipping.ciudad),
    barrio: sanitizeText(shipping.barrio),
    notas: sanitizeText(shipping.notas),
  }
}

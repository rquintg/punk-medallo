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
  ciudad: string
}) {
  return {
    nombre: sanitizeText(shipping.nombre),
    email: shipping.email.trim().toLowerCase(),
    telefono: shipping.telefono.replace(/\D/g, '').slice(0, 10),
    direccion: sanitizeText(shipping.direccion),
    ciudad: sanitizeText(shipping.ciudad),
  }
}

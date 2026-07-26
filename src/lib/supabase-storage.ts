const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const BUCKET = 'productos'

export function getProductoImageUrl(slug: string, updatedAt?: string | null) {
  const url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${slug}`
  return updatedAt ? `${url}?t=${new Date(updatedAt).getTime()}` : url
}

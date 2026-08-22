/**
 * Convierte un link de transmision (YouTube, Facebook u otro) a URL de embed.
 * Acepta: watch?v=, youtu.be/, /live/, /embed/, /shorts/ de YouTube;
 * facebook.com/...videos/... y /live/... (via plugin oficial);
 * cualquier otra URL https pasa tal cual (Twitch/Vimeo ya dan embed).
 */
export function toEmbedUrl(raw: string | null | undefined): string | null {
  const url = raw?.trim() ?? ''
  if (!url) return null
  if (!/^https:\/\//i.test(url) || url.length > 500) return null

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }

  const host = parsed.hostname.replace(/^www\./, '')

  // YouTube
  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be') {
    const id =
      host === 'youtu.be'
        ? parsed.pathname.slice(1)
        : parsed.searchParams.get('v') ??
          parsed.pathname.match(/\/(live|embed|shorts)\/([^/?]+)/)?.[2] ??
          ''
    if (/^[\w-]{6,20}$/.test(id)) {
      return `https://www.youtube.com/embed/${id}?rel=0`
    }
    return null
  }

  // Facebook (plugin oficial de video)
  if (host === 'facebook.com' || host === 'fb.watch' || host === 'm.facebook.com') {
    return `https://www.facebook.com/plugins/video.php?height=314&href=${encodeURIComponent(url)}&show_text=false`
  }

  // Otra plataforma: pasar tal cual si parece URL embebible
  return url
}

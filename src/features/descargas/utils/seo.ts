import type { Album } from "../types";

const SITE_URL = "https://punkmedallo.com";

export function albumUrl(slug: string): string {
  return `${SITE_URL}/descargas/${slug}`;
}

export function albumTitle(album: Album): string {
  return `${album.band} — ${album.title}${album.year ? ` (${album.year})` : ""}`;
}

export function albumDescription(album: Album): string {
  const tracks =
    album.trackList.length > 0
      ? ` con ${album.trackList.length} ${
          album.trackList.length === 1 ? "canción" : "canciones"
        }`
      : "";
  return `Descarga "${album.title}" de ${album.band}${tracks}. Del archivo del punk de Medellín.`;
}

export function albumSchema(album: Album): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "MusicAlbum",
    name: album.title,
    byArtist: {
      "@type": "MusicGroup",
      name: album.band,
    },
    url: albumUrl(album.slug),
    numTracks: album.trackList.length,
  };
  if (album.published) {
    schema.datePublished = album.published.slice(0, 10);
  }
  if (album.coverUrl) {
    schema.image = album.coverUrl;
  }
  if (album.trackList.length > 0) {
    schema.track = album.trackList.map((name, index) => ({
      "@type": "Track",
      position: index + 1,
      name,
    }));
  }
  return schema;
}

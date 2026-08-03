import type { AlbumFormat, BloggerRawPost } from "../types";
import { escapeRegExp, normalizeBand, slugify } from "./slug";

export const ALBUM_FORMAT_LABELS: Record<AlbumFormat, string> = {
  album: "ÁLBUM",
  ep: "EP",
  demo: "DEMO",
  discografia: "DISC.",
  compilado: "COMPILADO",
  split: "SPLIT",
  en_vivo: "EN VIVO",
};

export function detectFormatFromTitle(title: string): AlbumFormat {
  if (/discograf/i.test(title)) return "discografia";
  if (/\bEP\b/i.test(title)) return "ep";
  if (/demo/i.test(title)) return "demo";
  if (/^VA\b/i.test(title) || /compilad/i.test(title)) return "compilado";
  if (/split\b/i.test(title)) return "split";
  if (/en\s*vivo|\blive\b/i.test(title)) return "en_vivo";
  return "album";
}

export function resolveBandFromMeta(post: BloggerRawPost): string {
  const title = (post.title ?? "").trim();
  const labels = (post.labels ?? [])
    .map((label) => label.trim())
    .filter(Boolean);
  if (/^VA\b/i.test(title)) return "Varios Artistas";
  if (labels.length > 1) return "Varios Artistas";
  if (labels.length === 1) return labels[0];
  const beforeSeparator = title.split(/\s+[-–—]\s+/)[0]?.trim();
  return beforeSeparator || title;
}

export function cleanBandLabel(label: string): string {
  return label.replace(/\s+/g, " ").trim();
}

export function stripYear(title: string): string {
  return title
    .replace(/\s*\(?(19|20)\d{2}\s*[-–—]\s*(19|20)\d{2}\)?\s*$/, "")
    .replace(/\s*\(?\b(19|20)\d{2}\b\)?\s*$/, "")
    .trim();
}

export function withoutBandPrefix(title: string, band: string): string {
  return title
    .replace(new RegExp(`^\\s*${escapeRegExp(band)}\\s*[-–—:]?\\s*`, "i"), "")
    .trim();
}

export function resolveBand(post: BloggerRawPost, format: AlbumFormat): string {
  const band = resolveBandFromMeta(post);
  if (format === "compilado" || format === "split") return "Varios Artistas";
  if (normalizeBand(band) === normalizeBand(post.title ?? "")) return band;
  return band;
}

export function bandSlug(band: string): string {
  return slugify(band);
}

export function upgradeCoverResolution(
  url: string | null,
  size = 1200
): string | null {
  if (!url) return null;
  return url
    .replace(/\/w\d+-h\d+(\/[^/]+)$/, `/s${size}$1`)
    .replace(/\/s\d{2,4}(-c)?(\/[^/]+)$/, `/s${size}$2`);
}

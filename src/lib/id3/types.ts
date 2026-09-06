export interface ID3Picture {
  mimeType: string;
  type?: number; // 3 = front cover
  data: Uint8Array;
  previewUrl: string; // object URL for UI
}

export interface ID3Tags {
  title?: string;
  artist?: string;
  album?: string;
  year?: string;
  genre?: string;
  comment?: string;
  trackNumber?: string; // "5" or "5/12"
  picture?: ID3Picture | null;
}

export interface Track {
  id: string;
  file: File;
  originalBuffer: ArrayBuffer;
  tags: ID3Tags;
  editedTags: ID3Tags;
  status: "idle" | "edited" | "error";
  error?: string;
}

export function tagsEqual(a: ID3Tags, b: ID3Tags): boolean {
  return (
    a.title === b.title &&
    a.artist === b.artist &&
    a.album === b.album &&
    a.year === b.year &&
    a.genre === b.genre &&
    a.comment === b.comment &&
    a.trackNumber === b.trackNumber &&
    pictureEqual(a.picture ?? null, b.picture ?? null)
  );
}

function pictureEqual(a: ID3Picture | null, b: ID3Picture | null): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  if (a.mimeType !== b.mimeType) return false;
  if (a.data.length !== b.data.length) return false;
  // compare first 64 bytes only for perf (cover rarely same length diff content)
  const len = Math.min(64, a.data.length);
  for (let i = 0; i < len; i++) if (a.data[i] !== b.data[i]) return false;
  return true;
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, "_").trim().slice(0, 120) || "track";
}

export function buildFileName(tags: ID3Tags, fallback: string): string {
  const artist = (tags.artist || "").trim();
  const title = (tags.title || "").trim();
  let base: string;
  if (artist && title) base = `${artist} - ${title}`;
  else if (title) base = title;
  else if (artist) base = artist;
  else base = fallback.replace(/\.mp3$/i, "");
  return sanitizeFileName(base) + ".mp3";
}

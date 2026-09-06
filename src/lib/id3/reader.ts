import type { ID3Tags, ID3Picture } from "./types";

/**
 * Lee tags ID3 de un File usando music-metadata-browser (dynamic import).
 * Normaliza a ID3Tags. Nunca lanza si es un MP3 válido sin tags.
 */
export async function parseFile(file: File, arrayBuffer: ArrayBuffer): Promise<ID3Tags> {
  const { parseBuffer } = await import("music-metadata-browser");
  // parseBuffer expects Uint8Array
  const uint8 = new Uint8Array(arrayBuffer);
  const metadata = await parseBuffer(uint8, file.type || "audio/mpeg", {
    duration: false,
    skipCovers: false,
  });

  const common = metadata.common;
  const tags: ID3Tags = {};

  if (common.title) tags.title = String(common.title);
  if (common.artist) tags.artist = String(common.artist);
  if (common.album) tags.album = String(common.album);
  if (common.year) tags.year = String(common.year);
  if (common.genre && common.genre.length) tags.genre = common.genre[0];
  if (common.comment && common.comment.length) {
    const c = common.comment[0];
    tags.comment = typeof c === "string" ? c : (c as { text?: string }).text ?? String(c);
  }
  if (common.track?.no) {
    const no = String(common.track.no);
    const of = common.track.of ? `/${common.track.of}` : "";
    tags.trackNumber = no + of;
  }

  if (common.picture && common.picture.length > 0) {
    const pic = common.picture[0];
    const data = pic.data instanceof Uint8Array ? pic.data : new Uint8Array(pic.data as unknown as ArrayBuffer);
    const mimeType = pic.format || "image/jpeg";
    const blob = new Blob([data as BlobPart], { type: mimeType });
    const previewUrl = URL.createObjectURL(blob);
    const picture: ID3Picture = {
      mimeType,
      type: 3,
      data,
      previewUrl,
    };
    tags.picture = picture;
  } else {
    tags.picture = null;
  }

  return tags;
}

/** Libera object URLs de pictures */
export function revokePicture(pic: ID3Picture | null | undefined) {
  if (pic?.previewUrl?.startsWith("blob:")) {
    URL.revokeObjectURL(pic.previewUrl);
  }
}

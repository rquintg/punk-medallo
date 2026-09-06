import type { ID3Tags } from "./types";

/**
 * Escribe tags ID3v2.3 sobre un buffer existente.
 * Usa browser-id3-writer (dynamic import). Devuelve Blob mp3.
 * Nota: TPE1/TCON esperan string[] y TYER number según spec v2.3.
 */
export async function writeTags(
  originalBuffer: ArrayBuffer,
  tags: ID3Tags
): Promise<Blob> {
  const mod = (await import("browser-id3-writer")) as unknown as {
    default?: unknown;
    ID3Writer?: unknown;
  };
  const ID3Writer: new (buffer: ArrayBuffer) => ID3WriterInstance =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((mod as any).default ?? (mod as any).ID3Writer ?? mod) as unknown as new (
      buffer: ArrayBuffer
    ) => ID3WriterInstance;

  const writer = new ID3Writer(originalBuffer);

  setOrRemove(writer, "TIT2", tags.title);
  setOrRemove(writer, "TPE1", tags.artist);
  setOrRemove(writer, "TALB", tags.album);
  setOrRemove(writer, "TYER", tags.year);
  setOrRemove(writer, "TCON", tags.genre);
  setOrRemove(writer, "COMM", tags.comment, { description: "", language: "eng" });
  setOrRemove(writer, "TRCK", tags.trackNumber);

  // Portada
  if (tags.picture && tags.picture.data.length > 0) {
    const ab = tags.picture.data.buffer.slice(
      tags.picture.data.byteOffset,
      tags.picture.data.byteOffset + tags.picture.data.byteLength
    ) as ArrayBuffer;
    writer.setFrame("APIC", {
      type: 3,
      data: ab,
      description: "Cover",
      useUnicodeEncoding: false,
    });
  } else if (tags.picture === null) {
    try {
      writer.removeFrame("APIC");
    } catch {}
  }

  writer.addTag();
  const blob: Blob = writer.getBlob();
  return blob;
}

type TextFrame = "TIT2" | "TALB" | "TRCK" | "TPE2" | "TPE3" | string;
type ArrayFrame = "TPE1" | "TCON" | "TCOM";
type NumberFrame = "TYER" | "TBPM" | "TLEN";

interface ID3WriterInstance {
  setFrame(id: ArrayFrame, value: readonly string[]): this;
  setFrame(id: NumberFrame, value: number): this;
  setFrame(id: TextFrame, value: string): this;
  setFrame(
    id: "COMM",
    value: { description: string; language?: string; text: string }
  ): this;
  setFrame(
    id: "APIC",
    value: {
      type: number;
      data: ArrayBufferLike;
      description: string;
      useUnicodeEncoding?: boolean;
    }
  ): this;
  // fallback overload for dynamic calls
  setFrame(id: string, value: unknown): this;
  removeFrame(frame: string): void;
  removeTag(): void;
  addTag(): ArrayBuffer;
  getBlob(): Blob;
  getArrayBuffer(): ArrayBuffer;
}

const ARRAY_FRAMES = new Set<string>(["TPE1", "TCON", "TCOM"]);
const NUMBER_FRAMES = new Set<string>(["TYER", "TBPM", "TLEN"]);

function setOrRemove(
  writer: ID3WriterInstance,
  frame: string,
  value: string | undefined,
  extra?: Record<string, string>
) {
  const trimmed = value?.trim() ?? "";
  if (trimmed !== "") {
    if (frame === "COMM") {
      writer.setFrame(frame, {
        description: extra?.description ?? "",
        language: extra?.language ?? "eng",
        text: trimmed,
      });
      return;
    }
    if (ARRAY_FRAMES.has(frame)) {
      // browser-id3-writer exige array para TPE1/TCON/TCOM
      writer.setFrame(frame as ArrayFrame, [trimmed]);
      return;
    }
    if (NUMBER_FRAMES.has(frame)) {
      const num = parseInt(trimmed, 10);
      if (!Number.isNaN(num)) {
        writer.setFrame(frame as NumberFrame, num);
      }
      return;
    }
    writer.setFrame(frame, trimmed);
  } else {
    // Valor vacío: intentar borrar frame si existe (no borrar todo el tag)
    try {
      writer.removeFrame(frame);
    } catch {
      // algunos frames no existen, ignorar
    }
  }
}

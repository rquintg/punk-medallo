import type { ID3Picture } from "./types";

const MAX_BYTES = 500 * 1024; // 500KB recomendado
const MAX_DIM = 800; // px

export async function fileToPicture(file: File): Promise<ID3Picture> {
  const arrayBuffer = await file.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  // Validar mime
  const mimeType = file.type || guessMime(file.name) || "image/jpeg";

  // Si excede tamaño, comprimir vía canvas
  let finalData: Uint8Array<ArrayBuffer> = data as Uint8Array<ArrayBuffer>;
  let finalMime = mimeType;

  if (data.length > MAX_BYTES || (await needsResize(data, mimeType))) {
    const compressed = await compressImage(data, mimeType);
    if (compressed) {
      finalData = compressed.data as Uint8Array<ArrayBuffer>;
      finalMime = compressed.mimeType;
    }
  }

  const blob = new Blob([finalData as BlobPart], { type: finalMime });
  const previewUrl = URL.createObjectURL(blob);

  return {
    mimeType: finalMime,
    type: 3,
    data: finalData,
    previewUrl,
  };
}

function guessMime(name: string): string | null {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  return null;
}

async function needsResize(data: Uint8Array, mime: string): Promise<boolean> {
  try {
    const blob = new Blob([data as BlobPart], { type: mime });
    const bmp = await createImageBitmap(blob);
    const needs = bmp.width > MAX_DIM || bmp.height > MAX_DIM;
    bmp.close();
    return needs;
  } catch {
    return false;
  }
}

async function compressImage(
  data: Uint8Array,
  mime: string
): Promise<{ data: Uint8Array; mimeType: string } | null> {
  try {
    const blob = new Blob([data as BlobPart], { type: mime });
    const bitmap = await createImageBitmap(blob);
    const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    // Exportar siempre a jpeg para menor peso (a menos que sea png con transparencia — aquí siempre jpeg)
    const outBlob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.82)
    );
    if (!outBlob) return null;
    const ab = await outBlob.arrayBuffer();
    // Si aún es muy grande, reducir calidad
    if (ab.byteLength > MAX_BYTES) {
      const smaller: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.68)
      );
      if (smaller) {
        const ab2 = await smaller.arrayBuffer();
        return { data: new Uint8Array(ab2), mimeType: "image/jpeg" };
      }
    }
    return { data: new Uint8Array(ab), mimeType: "image/jpeg" };
  } catch {
    return null;
  }
}

export function revokePictureUrl(url: string | undefined) {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
}

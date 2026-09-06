import JSZip from "jszip";
import type { ID3Tags } from "./id3/types";
import { buildFileName } from "./id3/types";
import { writeTags } from "./id3/writer";

export interface ZipItem {
  file: File;
  originalBuffer: ArrayBuffer;
  tags: ID3Tags;
  editedTags: ID3Tags;
}

export async function createZipBlob(
  items: ZipItem[],
  onProgress?: (done: number, total: number) => void
): Promise<Blob> {
  const zip = new JSZip();

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const blob = await writeTags(it.originalBuffer, it.editedTags);
    const ab = await blob.arrayBuffer();
    const name = buildFileName(it.editedTags, it.file.name);
    // Evitar colisiones: si repetido, añadir (1)
    let finalName = name;
    let c = 1;
    while (zip.file(finalName)) {
      const base = name.replace(/\.mp3$/i, "");
      finalName = `${base} (${c}).mp3`;
      c++;
    }
    zip.file(finalName, ab);
    onProgress?.(i + 1, items.length);
  }

  const zipBlob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
  return zipBlob;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

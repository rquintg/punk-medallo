"use client";

import { useRef } from "react";
import { Image as ImageIcon, X, Upload } from "lucide-react";
import { Button } from "@/components/editor/ui/button";
import type { ID3Picture } from "@/lib/id3/types";
import { fileToPicture } from "@/lib/id3/image";
import { toast } from "sonner";

interface Props {
  picture?: ID3Picture | null;
  onChange: (pic: ID3Picture | null) => void;
  compact?: boolean;
}

export function ImagePicker({ picture, onChange, compact }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Solo imágenes JPG/PNG/WebP");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("Imagen muy grande (máx 10MB)");
      return;
    }
    try {
      const pic = await fileToPicture(f);
      onChange(pic);
      toast.success("Portada cargada");
    } catch {
      toast.error("No se pudo procesar la imagen");
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  if (picture?.previewUrl) {
    return (
      <div className={`relative group rounded-xl overflow-hidden border border-muted bg-background ${compact ? "h-20" : "h-40"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={picture.previewUrl} alt="Portada" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <Button size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>
            <Upload size={14} /> Cambiar
          </Button>
          <Button size="sm" variant="danger" onClick={() => onChange(null)}>
            <X size={14} /> Quitar
          </Button>
        </div>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
      </div>
    );
  }

  return (
    <div className={`rounded-xl border-2 border-dashed border-muted bg-background flex flex-col items-center justify-center gap-2 p-4 hover:border-[#333] hover:bg-surface transition-colors ${compact ? "h-20" : "h-40"}`}>
      <ImageIcon size={compact ? 18 : 22} className="text-white/30" />
      <p className="text-xs text-white/40 text-center">JPG/PNG/WebP · se comprime a &lt;500KB</p>
      <Button size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>
        <Upload size={14} /> Subir portada
      </Button>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
    </div>
  );
}

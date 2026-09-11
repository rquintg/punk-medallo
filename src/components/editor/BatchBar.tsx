"use client";

import { useState } from "react";
import { Input, Label } from "@/components/editor/ui/input";
import { Button } from "@/components/editor/ui/button";
import { ImagePicker } from "./ImagePicker";
import type { ID3Tags, ID3Picture } from "@/lib/id3/types";
import { Sparkles, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface Props {
  selectedCount: number;
  onApply: (patch: Partial<ID3Tags>) => void;
  onApplyPicture: (pic: ID3Picture | null, remove?: boolean) => void;
  onClearSelection: () => void;
}

export function BatchBar({ selectedCount, onApply, onApplyPicture, onClearSelection }: Props) {
  const [draft, setDraft] = useState<Partial<ID3Tags>>({});
  const [pic, setPic] = useState<ID3Picture | null | undefined>(undefined); // undefined = no change

  const set = (k: keyof ID3Tags, v: string) => setDraft((d) => ({ ...d, [k]: v }));

  const handleApply = () => {
    const hasText = Object.values(draft).some((v) => typeof v === "string" && v.trim() !== "");
    const hasPic = pic !== undefined;
    if (!hasText && !hasPic) {
      toast.error("Escribe al menos un campo para aplicar");
      return;
    }
    if (hasText) {
      onApply(draft);
    }
    if (hasPic) {
      if (pic === null) onApplyPicture(null, true);
      else if (pic) onApplyPicture(pic);
    }
    setDraft({});
    setPic(undefined);
    toast.success(`Aplicado a ${selectedCount} canciones`);
  };

  if (selectedCount === 0) return null;

  return (
    <div className="sticky top-[64px] z-20 bg-gradient-to-br from-[#1a0a0a] to-surface border border-primary/30 rounded-2xl p-4 sm:p-5 shadow-[0_8px_32px_rgba(220,38,38,0.2)] backdrop-blur">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white">
            <Sparkles size={16} />
          </span>
          <div>
            <p className="text-white font-bold text-sm leading-none">Edición masiva</p>
            <p className="text-white/50 text-xs">{selectedCount} seleccionadas · solo se sobrescriben campos con texto</p>
          </div>
        </div>
        <button onClick={onClearSelection} className="text-xs font-semibold tracking-widest uppercase text-white/50 hover:text-white flex items-center gap-1.5">
          <X size={14} /> Limpiar selección
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <Label>Título</Label>
          <Input value={(draft.title as string) ?? ""} onChange={(e) => set("title", e.target.value)} placeholder="(sin cambios)" />
        </div>
        <div>
          <Label>Artista</Label>
          <Input value={(draft.artist as string) ?? ""} onChange={(e) => set("artist", e.target.value)} placeholder="(sin cambios)" />
        </div>
        <div>
          <Label>Álbum</Label>
          <Input value={(draft.album as string) ?? ""} onChange={(e) => set("album", e.target.value)} placeholder="(sin cambios)" />
        </div>
        <div>
          <Label>Año</Label>
          <Input value={(draft.year as string) ?? ""} onChange={(e) => set("year", e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="(sin cambios)" />
        </div>
        <div>
          <Label>Género</Label>
          <Input value={(draft.genre as string) ?? ""} onChange={(e) => set("genre", e.target.value)} placeholder="(sin cambios)" />
        </div>
        <div>
          <Label>Pista</Label>
          <Input value={(draft.trackNumber as string) ?? ""} onChange={(e) => set("trackNumber", e.target.value)} placeholder="(sin cambios)" />
        </div>
      </div>

      <div className="mt-3">
        <Label className="flex items-center gap-1.5"><ImageIcon size={12} /> Portada masiva (opcional)</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div className="sm:col-span-2">
            {pic === undefined ? (
              <div className="h-20 rounded-xl border-2 border-dashed border-muted bg-background flex items-center justify-center text-white/30 text-xs">
                Sin cambios en portada
              </div>
            ) : (
              <ImagePicker picture={pic ?? null} onChange={setPic} compact />
            )}
          </div>
          <div className="flex gap-2">
            {pic === undefined ? (
              <Button variant="secondary" size="sm" onClick={() => setPic(null as unknown as ID3Picture)} className="flex-1">
                Preparar portada
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setPic(undefined)} className="flex-1">
                Sin cambios
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button onClick={handleApply} className="flex-1">
          <Sparkles size={16} /> Aplicar a {selectedCount}
        </Button>
      </div>
    </div>
  );
}

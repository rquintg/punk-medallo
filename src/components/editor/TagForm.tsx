"use client";

import { useState } from "react";
import { Input, Label, Textarea } from "@/components/editor/ui/input";
import { Button } from "@/components/editor/ui/button";
import { ImagePicker } from "./ImagePicker";
import type { ID3Tags } from "@/lib/id3/types";
import { Save, X } from "lucide-react";

interface Props {
  tags: ID3Tags;
  fileName: string;
  onSave: (tags: ID3Tags) => void;
  onClose: () => void;
}

export function TagForm({ tags, fileName, onSave, onClose }: Props) {
  const [draft, setDraft] = useState<ID3Tags>(tags);



  // Manual sync via render-phase check (recommended pattern to avoid setState in effect)
  const [prevTags, setPrevTags] = useState(tags);
  if (prevTags !== tags) {
    setPrevTags(tags);
    setDraft(tags);
  }

  const set = (k: keyof ID3Tags, v: string) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between gap-3 p-5 border-b border-muted">
        <div className="min-w-0">
          <p className="text-xs tracking-widest uppercase text-white/40 font-semibold">Editando</p>
          <p className="text-white font-bold truncate">{fileName}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors shrink-0">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div>
          <Label>Portada</Label>
          <ImagePicker
            picture={draft.picture ?? null}
            onChange={(pic) => setDraft((d) => ({ ...d, picture: pic }))}
          />
        </div>

        <div>
          <Label htmlFor="title">Título</Label>
          <Input id="title" value={draft.title ?? ""} onChange={(e) => set("title", e.target.value)} placeholder="Nombre de la canción" />
        </div>
        <div>
          <Label htmlFor="artist">Artista</Label>
          <Input id="artist" value={draft.artist ?? ""} onChange={(e) => set("artist", e.target.value)} placeholder="Artista / Banda" />
        </div>
        <div>
          <Label htmlFor="album">Álbum</Label>
          <Input id="album" value={draft.album ?? ""} onChange={(e) => set("album", e.target.value)} placeholder="Nombre del álbum" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="year">Año</Label>
            <Input id="year" value={draft.year ?? ""} onChange={(e) => set("year", e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="2024" inputMode="numeric" />
          </div>
          <div>
            <Label htmlFor="track">Pista</Label>
            <Input id="track" value={draft.trackNumber ?? ""} onChange={(e) => set("trackNumber", e.target.value)} placeholder="5 o 5/12" />
          </div>
        </div>

        <div>
          <Label htmlFor="genre">Género</Label>
          <Input id="genre" value={draft.genre ?? ""} onChange={(e) => set("genre", e.target.value)} placeholder="Punk, Rock, Hip Hop..." list="genres" />
          <datalist id="genres">
            <option value="Punk" />
            <option value="Hardcore" />
            <option value="Rock" />
            <option value="Metal" />
            <option value="Hip Hop" />
            <option value="Electronic" />
            <option value="Ska" />
          </datalist>
        </div>

        <div>
          <Label htmlFor="comment">Comentario</Label>
          <Textarea id="comment" value={draft.comment ?? ""} onChange={(e) => set("comment", e.target.value)} placeholder="Notas, créditos..." rows={3} />
        </div>
      </div>

      <div className="p-4 border-t border-muted flex gap-2 bg-background/50">
        <Button variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
        <Button className="flex-1" onClick={() => onSave(draft)}>
          <Save size={16} /> Guardar
        </Button>
      </div>
    </div>
  );
}

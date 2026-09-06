"use client";

import { Music, Pencil, Download, Trash2, Check } from "lucide-react";
import { Button } from "@/components/editor/ui/button";
import { Badge } from "@/components/editor/ui/badge";
import type { Track } from "@/lib/id3/types";

interface Props {
  tracks: Track[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: (v: boolean) => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
  onDownload: (id: string) => void;
}

export function TrackTable({ tracks, selectedIds, onToggleSelect, onSelectAll, onEdit, onRemove, onDownload }: Props) {
  const allSelected = tracks.length > 0 && selectedIds.size === tracks.length;

  if (tracks.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#262626] bg-[#111111]">
      {/* header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#262626] bg-[#0f0f0f]">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => onSelectAll(e.target.checked)}
            className="h-4 w-4 rounded border-[#333] bg-[#0a0a0a] text-[#dc2626] focus:ring-[#dc2626]/30 accent-[#dc2626]"
          />
          <span className="text-xs font-bold tracking-widest uppercase text-white/60">Seleccionar todo</span>
        </label>
        <span className="ml-auto text-xs text-white/30">{tracks.length} pistas</span>
      </div>

      {/* desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] tracking-widest uppercase text-white/40 border-b border-[#1f1f1f]">
              <th className="px-3 py-2.5 w-10"></th>
              <th className="px-2 py-2.5 w-14">Portada</th>
              <th className="px-3 py-2.5">Título</th>
              <th className="px-3 py-2.5">Artista</th>
              <th className="px-3 py-2.5">Álbum</th>
              <th className="px-3 py-2.5 w-16">Año</th>
              <th className="px-3 py-2.5 w-24">Estado</th>
              <th className="px-3 py-2.5 w-[200px] text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((t) => {
              const checked = selectedIds.has(t.id);
              const cover = t.editedTags.picture?.previewUrl;
              const isEdited = t.status === "edited";
              return (
                <tr key={t.id} className={`border-b border-[#1a1a1a] hover:bg-[#1a1a1a] transition-colors ${checked ? "bg-[#1a1a1a]" : ""} ${t.status === "error" ? "opacity-60" : ""}`}>
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleSelect(t.id)}
                      className="h-4 w-4 rounded border-[#333] bg-[#0a0a0a] accent-[#dc2626]"
                    />
                  </td>
                  <td className="px-2 py-3">
                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-[#0a0a0a] border border-[#262626] flex items-center justify-center shrink-0">
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cover} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Music size={16} className="text-white/20" />
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-white font-semibold truncate max-w-[180px] leading-tight">{t.editedTags.title || <span className="text-white/30 italic">Sin título</span>}</p>
                    <p className="text-white/30 text-xs truncate max-w-[180px]">{t.file.name}</p>
                  </td>
                  <td className="px-3 py-3 text-white/80 truncate max-w-[140px]">{t.editedTags.artist || <span className="text-white/20">—</span>}</td>
                  <td className="px-3 py-3 text-white/60 truncate max-w-[160px]">{t.editedTags.album || <span className="text-white/20">—</span>}</td>
                  <td className="px-3 py-3 text-white/60">{t.editedTags.year || "—"}</td>
                  <td className="px-3 py-3">
                    {t.status === "error" ? (
                      <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Error</Badge>
                    ) : isEdited ? (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Editado</Badge>
                    ) : (
                      <Badge className="bg-white/5 text-white/40 border-white/10">Sin cambios</Badge>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button size="sm" variant="secondary" onClick={() => onEdit(t.id)} className="h-8 px-3">
                        <Pencil size={14} /> Editar
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => onDownload(t.id)} className="h-8 w-8 p-0">
                        <Download size={14} />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => onRemove(t.id)} className="h-8 w-8 text-white/40 hover:text-red-400">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* mobile cards */}
      <div className="md:hidden divide-y divide-[#1a1a1a]">
        {tracks.map((t) => {
          const checked = selectedIds.has(t.id);
          const cover = t.editedTags.picture?.previewUrl;
          return (
            <div key={t.id} className={`p-4 flex gap-3 ${checked ? "bg-[#1a1a1a]" : ""}`}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggleSelect(t.id)}
                className="mt-1 h-4 w-4 rounded accent-[#dc2626]"
              />
              <div className="h-14 w-14 rounded-xl overflow-hidden bg-[#0a0a0a] border border-[#262626] flex items-center justify-center shrink-0">
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Music size={18} className="text-white/20" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-bold text-sm truncate">{t.editedTags.title || t.file.name}</p>
                <p className="text-white/50 text-xs truncate">{t.editedTags.artist || "Artista desconocido"} · {t.editedTags.album || "Sin álbum"}</p>
                <div className="flex items-center gap-2 mt-2">
                  {t.status === "edited" && <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]"><Check size={10}/> Editado</Badge>}
                  {t.status === "error" && <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px]">Error</Badge>}
                  <span className="text-white/20 text-xs">{t.editedTags.year || ""}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="secondary" onClick={() => onEdit(t.id)} className="flex-1 h-8"><Pencil size={14}/> Editar</Button>
                  <Button size="sm" variant="secondary" onClick={() => onDownload(t.id)} className="h-8 w-8 p-0"><Download size={14}/></Button>
                  <Button size="icon" variant="ghost" onClick={() => onRemove(t.id)} className="h-8 w-8"><Trash2 size={14}/></Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

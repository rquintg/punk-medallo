"use client";

import { useState, useCallback } from "react";
import { useEditorStore } from "@/store/editorStore";
import { DropZone } from "./DropZone";
import { TrackTable } from "./TrackTable";
import { BatchBar } from "./BatchBar";
import { TagForm } from "./TagForm";
import { Button } from "@/components/editor/ui/button";
import { Card } from "@/components/editor/ui/card";
import { writeTags } from "@/lib/id3/writer";
import { createZipBlob, downloadBlob } from "@/lib/zip";
import { buildFileName } from "@/lib/id3/types";
import { Download, Trash2, Package, Loader2, Sparkles, Info } from "lucide-react";
import { toast } from "sonner";

export function EditorClient() {
  const {
    tracks,
    selectedIds,
    isLoading,
    editingId,
    addFiles,
    removeTrack,
    clearAll,
    toggleSelect,
    selectAll,
    setEditingId,
    updateTrackTags,
    setTrackPicture,
    removeTrackPicture,
    applyBatch,
    setBatchPicture,
  } = useEditorStore();

  const [downloading, setDownloading] = useState(false);
  const editingTrack = tracks.find((t) => t.id === editingId) ?? null;

  const handleDownloadOne = useCallback(
    async (id: string) => {
      const t = tracks.find((x) => x.id === id);
      if (!t) return;
      try {
        const blob = await writeTags(t.originalBuffer, t.editedTags);
        const name = buildFileName(t.editedTags, t.file.name);
        downloadBlob(blob, name);
        toast.success(`Descargado ${name}`);
      } catch (e) {
        toast.error("No se pudo generar el MP3");
        console.error(e);
      }
    },
    [tracks]
  );

  const handleDownloadAll = useCallback(async () => {
    if (tracks.length === 0) return;
    setDownloading(true);
    try {
      const editedOnly = tracks.filter((t) => t.status !== "error");
      if (editedOnly.length === 0) {
        toast.error("No hay pistas válidas");
        return;
      }
      // Si solo 1, descarga directa; si varios, ZIP
      if (editedOnly.length === 1) {
        const t = editedOnly[0];
        const blob = await writeTags(t.originalBuffer, t.editedTags);
        downloadBlob(blob, buildFileName(t.editedTags, t.file.name));
        toast.success("Descarga lista");
      } else {
        const zipBlob = await createZipBlob(
          editedOnly.map((t) => ({
            file: t.file,
            originalBuffer: t.originalBuffer,
            tags: t.tags,
            editedTags: t.editedTags,
          }))
        );
        downloadBlob(zipBlob, `mp3-editados-${new Date().toISOString().slice(0, 10)}.zip`);
        toast.success(`${editedOnly.length} canciones en ZIP`);
      }
    } catch (e) {
      toast.error("Error al crear la descarga");
      console.error(e);
    } finally {
      setDownloading(false);
    }
  }, [tracks]);

  const handleDownloadSelected = useCallback(async () => {
    const selected = tracks.filter((t) => selectedIds.has(t.id));
    if (selected.length === 0) {
      toast.error("Selecciona al menos una canción");
      return;
    }
    setDownloading(true);
    try {
      if (selected.length === 1) {
        const t = selected[0];
        const blob = await writeTags(t.originalBuffer, t.editedTags);
        downloadBlob(blob, buildFileName(t.editedTags, t.file.name));
        toast.success("Descarga lista");
      } else {
        const zipBlob = await createZipBlob(
          selected.map((t) => ({
            file: t.file,
            originalBuffer: t.originalBuffer,
            tags: t.tags,
            editedTags: t.editedTags,
          }))
        );
        downloadBlob(zipBlob, `mp3-seleccion-${new Date().toISOString().slice(0, 10)}.zip`);
        toast.success(`${selected.length} canciones en ZIP`);
      }
    } catch (e) {
      toast.error("Error al crear la descarga");
      console.error(e);
    } finally {
      setDownloading(false);
    }
  }, [tracks, selectedIds]);

  const hasTracks = tracks.length > 0;
  const editedCount = tracks.filter((t) => t.status === "edited").length;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-20 pb-6 sm:pt-24 sm:pb-8 space-y-6">
      {/* Header hero — estilo orden tienda/boletería (degradado rojo) */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-br from-[#1a0a0a] via-[#140707] to-[#0a0a0a] p-6 sm:p-8">
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `repeating-linear-gradient(45deg, #dc2626 0 1px, transparent 1px 10px)` }} aria-hidden />
        <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex-1 min-w-0">
            <p className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.18em] uppercase text-[#ff4444] bg-[#ff4444]/10 border border-[#ff4444]/20 rounded-full px-3 py-1 w-fit">
              <Sparkles size={12} /> Punk Medallo · MP3 Editor
            </p>
            <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-white leading-none">
              Edita tus <span className="text-[#dc2626]">MP3</span> en segundos
            </h1>
            <p className="mt-2 text-sm sm:text-base text-white/60 max-w-2xl">
              Título, artista, álbum, año, género y portada. Edición por lotes, descarga individual o ZIP masivo.
              <span className="text-white font-semibold"> Nada sale de tu navegador.</span>
            </p>
          </div>
          <div className="shrink-0 flex flex-col gap-2">
            <div className="hidden sm:flex items-center gap-2 text-xs text-white/40">
              <Info size={14} /> 100% client-side · Gratis · Sin registro
            </div>
            {hasTracks && (
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleDownloadAll} disabled={downloading}>
                  {downloading ? <Loader2 size={16} className="animate-spin" /> : <Package size={16} />}
                  {tracks.length === 1 ? "Descargar MP3" : `Descargar todo (${tracks.length}) ZIP`}
                </Button>
                {selectedIds.size > 0 && (
                  <Button variant="secondary" onClick={handleDownloadSelected} disabled={downloading}>
                    <Download size={16} /> ZIP seleccionados ({selectedIds.size})
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <DropZone onFiles={addFiles} isLoading={isLoading} count={tracks.length} />

      {hasTracks && (
        <>
          <BatchBar
            selectedCount={selectedIds.size}
            onApply={applyBatch}
            onApplyPicture={(pic) => {
              if (pic === null) {
                // quitar portada a seleccionados
                const ids = Array.from(selectedIds);
                for (const id of ids) removeTrackPicture(id);
                toast.success("Portada quitada de seleccionados");
              } else if (pic) {
                setBatchPicture(pic);
              }
            }}
            onClearSelection={() => selectAll(false)}
          />

          <TrackTable
            tracks={tracks}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onSelectAll={selectAll}
            onEdit={setEditingId}
            onRemove={removeTrack}
            onDownload={handleDownloadOne}
          />

          <Card className="p-4 flex flex-col sm:flex-row items-center gap-3 justify-between">
            <div className="text-sm">
              <span className="text-white font-bold">{tracks.length} pistas</span>
              <span className="text-white/40"> · </span>
              <span className="text-emerald-400 font-semibold">{editedCount} editadas</span>
              <span className="text-white/40"> · </span>
              <span className="text-white/60">{selectedIds.size} seleccionadas</span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="secondary" onClick={handleDownloadAll} disabled={downloading || tracks.length === 0} className="flex-1 sm:flex-none">
                {downloading ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                Descargar {tracks.length > 1 ? "ZIP" : "MP3"}
              </Button>
              <Button variant="danger" onClick={() => { if (confirm(`¿Quitar ${tracks.length} canciones?`)) clearAll(); }} className="flex-1 sm:flex-none">
                <Trash2 size={16} /> Limpiar
              </Button>
            </div>
          </Card>
        </>
      )}

      {/* Drawer lateral */}
      {editingTrack && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingId(null)} />
          <div className="relative w-full max-w-md bg-[#111111] border-l border-[#262626] shadow-[-16px_0_64px_rgba(0,0,0,0.6)] flex flex-col animate-[fadeIn_0.2s_ease]">
            <TagForm
              tags={editingTrack.editedTags}
              fileName={editingTrack.file.name}
              onClose={() => setEditingId(null)}
              onSave={(next) => {
                // diff picture
                const picChanged = next.picture !== editingTrack.editedTags.picture;
                if (picChanged) {
                  if (next.picture) setTrackPicture(editingTrack.id, next.picture);
                  else if (next.picture === null) removeTrackPicture(editingTrack.id);
                }
                // other fields
                const { picture: _pic, ...rest } = next;
                void _pic;
                updateTrackTags(editingTrack.id, rest as Partial<typeof next>);
                // also handle picture via setTrackPicture already
                if (picChanged && next.picture) {
                  // picture already set
                } else if (!picChanged) {
                  // no picture change, just text
                }
                toast.success("Cambios guardados");
                setEditingId(null);
              }}
            />
          </div>
        </div>
      )}

      <p className="text-center text-xs font-medium tracking-wide text-white/60 pt-2">
        Tip: selecciona varias canciones y usa “Edición masiva” para cambiar artista/álbum de todo un disco a la vez.
      </p>
    </div>
  );
}

"use client";

import { create } from "zustand";
import type { Track, ID3Tags, ID3Picture } from "@/lib/id3/types";
import { tagsEqual } from "@/lib/id3/types";
import { parseFile } from "@/lib/id3/reader";

interface EditorState {
  tracks: Track[];
  selectedIds: Set<string>;
  isLoading: boolean;
  editingId: string | null; // panel lateral
  // actions
  addFiles: (files: File[]) => Promise<void>;
  removeTrack: (id: string) => void;
  clearAll: () => void;
  toggleSelect: (id: string) => void;
  selectAll: (v: boolean) => void;
  setEditingId: (id: string | null) => void;
  updateTrackTags: (id: string, patch: Partial<ID3Tags>) => void;
  setTrackPicture: (id: string, pic: ID3Picture | null) => void;
  removeTrackPicture: (id: string) => void;
  applyBatch: (patch: Partial<ID3Tags>) => void;
  setBatchPicture: (pic: ID3Picture | null) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  tracks: [],
  selectedIds: new Set<string>(),
  isLoading: false,
  editingId: null,

  addFiles: async (files: File[]) => {
    const mp3Files = files.filter((f) => f.type === "audio/mpeg" || f.name.toLowerCase().endsWith(".mp3"));
    if (mp3Files.length === 0) return;
    set({ isLoading: true });

    const newTracks: Track[] = [];
    for (const file of mp3Files) {
      try {
        const ab = await file.arrayBuffer();
        // clon para parse + guardar original (parse consume copia)
        const abForParse = ab.slice(0);
        const tags = await parseFile(file, abForParse);
        // Si tags.picture viene con previewUrl, lo mantenemos
        const editedTags: ID3Tags = { ...tags };
        // Deep copy picture data to avoid sharing buffer reference issues? keep same.
        newTracks.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          file,
          originalBuffer: ab,
          tags,
          editedTags,
          status: "idle",
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Error al leer";
        newTracks.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          file,
          originalBuffer: await file.arrayBuffer().catch(() => new ArrayBuffer(0)),
          tags: {},
          editedTags: {},
          status: "error",
          error: msg,
        });
      }
    }

    set((s) => ({
      tracks: [...s.tracks, ...newTracks],
      isLoading: false,
    }));
  },

  removeTrack: (id: string) =>
    set((s) => {
      const t = s.tracks.find((x) => x.id === id);
      if (t?.editedTags.picture?.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(t.editedTags.picture.previewUrl);
      }
      if (t?.tags.picture?.previewUrl?.startsWith("blob:")) {
        // si son distintos, revocar ambos
        if (t.tags.picture.previewUrl !== t.editedTags.picture?.previewUrl) {
          URL.revokeObjectURL(t.tags.picture.previewUrl);
        }
      }
      const nextSelected = new Set(s.selectedIds);
      nextSelected.delete(id);
      return {
        tracks: s.tracks.filter((x) => x.id !== id),
        selectedIds: nextSelected,
        editingId: s.editingId === id ? null : s.editingId,
      };
    }),

  clearAll: () =>
    set((s) => {
      for (const t of s.tracks) {
        if (t.editedTags.picture?.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(t.editedTags.picture.previewUrl);
        if (t.tags.picture?.previewUrl?.startsWith("blob:") && t.tags.picture.previewUrl !== t.editedTags.picture?.previewUrl) {
          URL.revokeObjectURL(t.tags.picture.previewUrl);
        }
      }
      return { tracks: [], selectedIds: new Set(), editingId: null };
    }),

  toggleSelect: (id: string) =>
    set((s) => {
      const next = new Set(s.selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selectedIds: next };
    }),

  selectAll: (v: boolean) =>
    set((s) => ({
      selectedIds: v ? new Set(s.tracks.map((t) => t.id)) : new Set(),
    })),

  setEditingId: (id) => set({ editingId: id }),

  updateTrackTags: (id, patch) =>
    set((s) => ({
      tracks: s.tracks.map((t) => {
        if (t.id !== id) return t;
        const next: ID3Tags = { ...t.editedTags, ...patch };
        // undefined patch shouldn't overwrite with undefined? patch already filtered; but keep explicit
        const status: Track["status"] = tagsEqual(t.tags, next) ? "idle" : "edited";
        return { ...t, editedTags: next, status };
      }),
    })),

  setTrackPicture: (id, pic) =>
    set((s) => ({
      tracks: s.tracks.map((t) => {
        if (t.id !== id) return t;
        // revoke previous preview if blob
        if (t.editedTags.picture?.previewUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(t.editedTags.picture.previewUrl);
        }
        const next: ID3Tags = { ...t.editedTags, picture: pic };
        const status: Track["status"] = tagsEqual(t.tags, next) ? "idle" : "edited";
        return { ...t, editedTags: next, status };
      }),
    })),

  removeTrackPicture: (id) =>
    set((s) => ({
      tracks: s.tracks.map((t) => {
        if (t.id !== id) return t;
        if (t.editedTags.picture?.previewUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(t.editedTags.picture.previewUrl);
        }
        const next: ID3Tags = { ...t.editedTags, picture: null };
        const status: Track["status"] = tagsEqual(t.tags, next) ? "idle" : "edited";
        return { ...t, editedTags: next, status };
      }),
    })),

  applyBatch: (patch) =>
    set((s) => {
      // solo campos no vacíos aplican; picture se maneja aparte
      const clean: Partial<ID3Tags> = {};
      for (const [k, v] of Object.entries(patch)) {
        if (k === "picture") continue;
        const val = v as string | undefined;
        if (val !== undefined && val !== null && String(val).trim() !== "") {
          (clean as Record<string, unknown>)[k] = String(val).trim();
        }
      }
      if (Object.keys(clean).length === 0) return s;
      const ids = s.selectedIds;
      return {
        tracks: s.tracks.map((t) => {
          if (!ids.has(t.id)) return t;
          const next: ID3Tags = { ...t.editedTags, ...clean };
          const status: Track["status"] = tagsEqual(t.tags, next) ? "idle" : "edited";
          return { ...t, editedTags: next, status };
        }),
      };
    }),

  setBatchPicture: (pic) =>
    set((s) => {
      const ids = s.selectedIds;
      if (ids.size === 0) return s;
      return {
        tracks: s.tracks.map((t) => {
          if (!ids.has(t.id)) return t;
          if (t.editedTags.picture?.previewUrl?.startsWith("blob:")) {
            URL.revokeObjectURL(t.editedTags.picture.previewUrl);
          }
          // if pic exists, need to clone data for each track (share buffer but separate previewUrl?)
          // For previewUrl blob, each track sharing same blob URL is okay but revoke would affect all; clone URL per track
          let nextPic: ID3Picture | null = null;
          if (pic) {
            const blob = new Blob([pic.data as BlobPart], { type: pic.mimeType });
            const url = URL.createObjectURL(blob);
            nextPic = { mimeType: pic.mimeType, type: 3, data: pic.data, previewUrl: url };
          }
          const next: ID3Tags = { ...t.editedTags, picture: nextPic };
          const status: Track["status"] = tagsEqual(t.tags, next) ? "idle" : "edited";
          return { ...t, editedTags: next, status };
        }),
      };
    }),
}));

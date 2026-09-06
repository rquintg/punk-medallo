"use client";

import { useCallback, useState } from "react";
import { Upload, Music, Loader2 } from "lucide-react";

interface Props {
  onFiles: (files: File[]) => void;
  isLoading?: boolean;
  count?: number;
}

export function DropZone({ onFiles, isLoading, count }: Props) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files).filter(
        (f) => f.type === "audio/mpeg" || f.name.toLowerCase().endsWith(".mp3")
      );
      if (files.length) onFiles(files);
    },
    [onFiles]
  );

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length) onFiles(files);
    e.target.value = "";
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`relative group rounded-2xl border-2 border-dashed p-8 sm:p-10 text-center transition-all duration-300
        ${dragOver ? "border-[#dc2626] bg-[#dc2626]/10 scale-[1.01]" : "border-[#262626] bg-[#111111] hover:border-[#333] hover:bg-[#1a1a1a]"}`}
    >
      <div className="mx-auto flex flex-col items-center gap-4 max-w-lg">
        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-colors ${dragOver ? "bg-[#dc2626] text-white" : "bg-[#1a1a1a] border border-[#262626] text-white/80 group-hover:bg-[#dc2626] group-hover:text-white"}`}>
          {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Upload size={24} />}
        </div>

        <div>
          <p className="text-white font-bold text-lg tracking-tight">
            Arrastra tus MP3 aquí
          </p>
          <p className="text-white/50 text-sm mt-1">
            o haz clic para seleccionar. Todo se procesa en tu navegador.
          </p>
        </div>

        <label className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#dc2626] text-white font-semibold text-sm hover:bg-[#b91c1c] cursor-pointer transition-colors shadow-[0_4px_16px_rgba(220,38,38,0.35)]">
          <Music size={16} />
          Seleccionar archivos
          <input type="file" accept=".mp3,audio/mpeg" multiple className="hidden" onChange={handleInput} />
        </label>

        <p className="text-white/30 text-xs">
          Solo .mp3 · Múltiples archivos soportados · Sin límite (recomendado &lt; 50 a la vez)
        </p>

        {typeof count === "number" && count > 0 && (
          <p className="text-xs font-semibold tracking-widest uppercase text-[#ff4444] bg-[#ff4444]/10 border border-[#ff4444]/20 rounded-full px-3 py-1">
            {count} {count === 1 ? "archivo cargado" : "archivos cargados"}
          </p>
        )}
      </div>
    </div>
  );
}

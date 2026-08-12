"use client";

import { CameraOff, RotateCw } from "lucide-react";

interface FotosEmptyStateProps {
  mensaje: string;
  onRetry?: () => void;
}

export function FotosEmptyState({ mensaje, onRetry }: FotosEmptyStateProps) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 border border-dashed border-neutral-800 text-center">
      <CameraOff className="h-10 w-10 text-neutral-600" aria-hidden="true" />
      <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">
        Sin material por ahora
      </p>
      <p className="max-w-md text-sm text-neutral-500">{mensaje}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-2 rounded-md border border-neutral-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:border-[#dc2626] hover:text-[#dc2626]"
        >
          <RotateCw size={14} aria-hidden="true" />
          Reintentar
        </button>
      )}
    </div>
  );
}
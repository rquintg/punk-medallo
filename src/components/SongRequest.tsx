"use client";

import { useEffect, useCallback } from "react";
import { X, ArrowLeft } from "lucide-react";

const AZURACAST_WIDGET_URL =
  "https://a3.asurahosting.com/public/punk_medallo/embed-requests?theme=dark";

interface SongRequestProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SongRequest({ isOpen, onClose }: SongRequestProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1050] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="song-request-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-[rgba(7,7,7,0.56)] text-[#f8f9fa] rounded-lg shadow-[0px_0px_6px_6px_rgba(0,0,0,0.75)] z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(149,157,165,0.2)] bg-[rgba(7,7,7,0.3)] rounded-t-lg">
          <div className="flex items-center gap-2">
            <ArrowLeft className="text-red-500" size={16} />
            <h6
              id="song-request-title"
              className="m-0 font-bold text-sm text-[#f8f9fa]"
            >
              Puedes solicitar la misma cancion cada 5 minutos
            </h6>
          </div>
          <button
            onClick={onClose}
            className="bg-transparent border-0 text-white/80 hover:text-white transition-opacity cursor-pointer p-1"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-0">
          <iframe
            src={AZURACAST_WIDGET_URL}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
            title="AzuraCast Song Request Widget"
            loading="lazy"
            referrerPolicy="no-referrer"
            aria-label="Formulario de solicitud de canciones de Punk Medallo"
            className="w-full min-h-[600px] border-0"
          />
        </div>
      </div>
    </div>
  );
}

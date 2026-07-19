"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useFacebookPost from "@/hooks/useFacebookPost";
import SpinnerLoader from "@/components/util/SpinnerLoader";
import type { FacebookPhoto } from "@/lib/axiosFacebook";

export default function FotosContent({
  initialPhotos,
}: {
  initialPhotos?: FacebookPhoto[];
}) {
  const {
    photos,
    loading,
    error,
    currentPage,
    currentPhotos,
    totalPages,
    handleNextPage,
    handlePrevPage,
  } = useFacebookPost(initialPhotos || []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <SpinnerLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-20">{error}</div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center text-zinc-400 py-20">
        No se encontraron fotos.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-white mb-8 pb-4 border-b-2 border-[#a40202] md:invisible">
        Registro Fotográfico
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentPhotos.map((photo: FacebookPhoto) => (
          <div
            key={photo.id}
            className="relative group rounded-lg overflow-hidden bg-[rgba(52,58,64,0.3)]"
          >
            <div className="relative w-full h-64">
              <Image
                src={photo.full_picture}
                alt={photo.message || "Facebook post"}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                priority={false}
              />
            </div>
            <a
              href={photo.permalink_url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <span className="bg-[#a40202] text-white px-4 py-2 rounded font-semibold">
                Ver en Facebook
              </span>
            </a>
            {photo.message && (
              <div className="p-3 text-sm text-[#d0d0d0] line-clamp-2">
                {photo.message}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="bg-[#a40202] text-white px-6 py-2 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ff6b6b] transition-colors"
        >
          <ChevronLeft size={16} className="inline" /> Anterior
        </button>
        <span className="text-white font-medium">
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="bg-[#a40202] text-white px-6 py-2 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ff6b6b] transition-colors"
        >
          Siguiente <ChevronRight size={16} className="inline" />
        </button>
      </div>
    </div>
  );
}

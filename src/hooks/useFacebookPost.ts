"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { FacebookPhoto } from "@/lib/axiosFacebook";

export default function useFacebookPost(initialPhotos: FacebookPhoto[] = []) {
  const [currentPage, setCurrentPage] = useState(1);
  const photosPerPage = 6;

  const {
    data: photos = initialPhotos,
    isLoading: loading,
    error,
  } = useQuery<FacebookPhoto[]>({
    queryKey: ["facebook", "photos"],
    queryFn: async () => {
      const res = await fetch("/api/fotos");
      if (!res.ok) {
        throw new Error("Failed to fetch photos");
      }
      const json = await res.json();
      return json.photos || [];
    },
    // 10 minutes stale time
    staleTime: 600_000,
    // provide server-fetched initial data to avoid double fetch on mount
    initialData: initialPhotos,
  });

  const indexOfLastPhoto = currentPage * photosPerPage;
  const indexOfFirstPhoto = indexOfLastPhoto - photosPerPage;
  const currentPhotos = photos.slice(indexOfFirstPhoto, indexOfLastPhoto);
  const totalPages = Math.ceil(photos.length / photosPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return {
    photos,
    loading,
    error: error ? (error as Error).message || "Error fetching Facebook photos." : null,
    currentPage,
    currentPhotos,
    totalPages,
    handleNextPage,
    handlePrevPage,
  };
}

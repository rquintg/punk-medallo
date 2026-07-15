"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { InstagramPhoto } from "@/lib/axiosInstagram";

export default function useInstagramPosts(initialPhotos: InstagramPhoto[] = []) {
  const [currentPage, setCurrentPage] = useState(1);
  const photosPerPage = 6;

  const {
    data: photos = initialPhotos,
    isLoading: loading,
    error,
  } = useQuery<InstagramPhoto[]>({
    queryKey: ["instagram", "photos"],
    queryFn: async () => {
      const res = await fetch("/api/eventos");
      if (!res.ok) throw new Error("Failed to fetch Instagram photos");
      const json = await res.json();
      return json.photos || [];
    },
    staleTime: 600_000,
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
    error: error ? (error as Error).message || "Error fetching Instagram photos." : null,
    currentPage,
    currentPhotos,
    totalPages,
    handleNextPage,
    handlePrevPage,
  };
}

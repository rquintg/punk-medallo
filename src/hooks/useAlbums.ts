"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Album, AlbumsPage, OrderBy } from "@/features/descargas/types";

interface UseAlbumsOptions {
  initialAlbums: Album[];
  initialNextPageToken: string | null;
}

export interface AlbumsFilters {
  letra: string | null;
  formato: string | null;
  banda: string | null;
  year: string | null;
}

export function useAlbums({
  initialAlbums,
  initialNextPageToken,
}: UseAlbumsOptions) {
  const [albums, setAlbums] = useState<Album[]>(initialAlbums);
  const [nextPageToken, setNextPageToken] = useState<string | null>(
    initialNextPageToken
  );
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [orderBy, setOrderBy] = useState<OrderBy>("published");
  const [filters, setFilters] = useState<AlbumsFilters>({
    letra: null,
    formato: null,
    banda: null,
    year: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstRun = useRef(true);

  const hasActiveFilters =
    Boolean(debouncedQuery) ||
    Boolean(filters.letra) ||
    Boolean(filters.formato) ||
    Boolean(filters.banda) ||
    Boolean(filters.year);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(timer);
  }, [query]);

  const fetchPage = useCallback(
    async (params: URLSearchParams): Promise<AlbumsPage> => {
      const res = await fetch(`/api/descargas?${params.toString()}`);
      if (!res.ok) throw new Error("Error al consultar el archivo");
      return res.json() as Promise<AlbumsPage>;
    },
    []
  );

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (orderBy) params.set("orderBy", orderBy);
    if (filters.letra) params.set("letra", filters.letra);
    if (filters.formato) params.set("formato", filters.formato);
    if (filters.banda) params.set("banda", filters.banda);
    if (filters.year) params.set("year", filters.year);
    fetchPage(params)
      .then((data) => {
        if (cancelled) return;
        setAlbums(data.albums);
        setNextPageToken(data.nextPageToken);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudo cargar el archivo");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, orderBy, filters, fetchPage]);

  const loadMore = useCallback(async () => {
    if (!nextPageToken || isLoadingMore || hasActiveFilters) return;
    setIsLoadingMore(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("pageToken", nextPageToken);
      if (orderBy) params.set("orderBy", orderBy);
      const data = await fetchPage(params);
      setAlbums((prev) => {
        const seen = new Set(prev.map((album) => album.slug));
        return [
          ...prev,
          ...data.albums.filter((album) => !seen.has(album.slug)),
        ];
      });
      setNextPageToken(data.nextPageToken);
    } catch {
      setError("No se pudo cargar más lanzamientos");
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextPageToken, isLoadingMore, hasActiveFilters, orderBy, fetchPage]);

  return {
    albums,
    nextPageToken,
    query,
    setQuery,
    orderBy,
    setOrderBy,
    filters,
    setFilters,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
  };
}

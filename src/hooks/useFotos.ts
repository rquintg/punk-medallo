"use client";

import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";
import type {
  FotoFacebook,
  ItemFotos,
  PaginaComentarios,
  PaginaFotos,
  VideoFacebook,
} from "@/features/fotos/types";

export type TipoFotos = "fotos" | "videos";

function fetchPagina(tipo: TipoFotos, after: string | null): Promise<PaginaFotos> {
  const params = new URLSearchParams();
  params.set("tipo", tipo);
  if (after) params.set("after", after);
  return fetch(`/api/fotos?${params.toString()}`).then((res) => {
    if (!res.ok) throw new Error("Error al cargar el registro");
    return res.json();
  });
}

interface UseFotosProps {
  tipo: TipoFotos;
  initialData?: PaginaFotos;
}

export function useFotos({ tipo, initialData }: UseFotosProps) {
  const queryClient = useQueryClient();
  const queryKey = ["fotos", tipo];

  const query = useInfiniteQuery<PaginaFotos>({
    queryKey,
    queryFn: ({ pageParam }) =>
      fetchPagina(tipo, (pageParam as string | null) ?? null),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.next ?? undefined,
    initialData: initialData
      ? { pages: [initialData], pageParams: [null as string | null] }
      : undefined,
    staleTime: 10 * 60 * 1000,
  });

  // Dedupe por id + orden cronológico desc (la API de Graph no garantiza
  // orden estable entre páginas según los campos pedidos).
  const items: ItemFotos[] = useMemo(() => {
    const porId = new Map<string, ItemFotos>();
    for (const page of query.data?.pages ?? []) {
      for (const item of page.items ?? []) porId.set(item.id, item);
    }
    return [...porId.values()].sort((a, b) =>
      (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
    );
  }, [query.data]);
  const hasMore = Boolean(query.hasNextPage);
  const isLoading = query.isLoading;
  const isFetchingMore = query.isFetchingNextPage;
  const error = query.error
    ? (query.error as Error).message
    : null;

  const loadMore = useCallback(() => {
    if (!query.hasNextPage || query.isFetchingNextPage) return;
    void query.fetchNextPage();
  }, [query]);

  // Prefetch del otro tab para navegación instantánea
  const otroTipo: TipoFotos = tipo === "fotos" ? "videos" : "fotos";
  useEffect(() => {
    const data = queryClient.getQueryData<{ pages: PaginaFotos[] }>([
      "fotos",
      otroTipo,
    ]);
    if (!data) {
      void queryClient.prefetchInfiniteQuery({
        queryKey: ["fotos", otroTipo],
        queryFn: ({ pageParam }) =>
          fetchPagina(otroTipo, (pageParam as string | null) ?? null),
        initialPageParam: null as string | null,
        getNextPageParam: (last: PaginaFotos) => last.next ?? undefined,
        staleTime: 10 * 60 * 1000,
      });
    }
  }, [otroTipo, queryClient]);

  const refetch = useCallback(() => query.refetch(), [query]);

  return {
    items,
    hasMore,
    isLoading,
    isFetchingMore,
    error,
    loadMore,
    refetch,
  };
}

export function useFotosTop(initialData?: ItemFotos[]) {
  return useQuery<ItemFotos[]>({
    queryKey: ["fotos", "top"],
    queryFn: () =>
      fetch("/api/fotos?tipo=top").then((res) => {
        if (!res.ok) throw new Error("Error al cargar las más vistas");
        return res.json().then((data: { items: ItemFotos[] }) => data.items);
      }),
    initialData,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export function useComentarios(id: string | null) {
  return useQuery<PaginaComentarios>({
    queryKey: ["fotos", "comentarios", id],
    queryFn: async () => {
      const res = await fetch(`/api/fotos/comentarios?id=${encodeURIComponent(id ?? "")}`);
      if (!res.ok) throw new Error("Error al cargar comentarios");
      return res.json();
    },
    enabled: Boolean(id),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}
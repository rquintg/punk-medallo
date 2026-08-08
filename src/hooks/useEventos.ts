"use client";

import { useQuery } from "@tanstack/react-query";
import type { Evento } from "@/features/eventos/types";

export default function useEventos(initialEventos: Evento[] = []) {
  const {
    data: eventos = initialEventos,
    isLoading: loading,
    isFetching,
    error,
    refetch,
  } = useQuery<Evento[]>({
    queryKey: ["instagram", "eventos"],
    queryFn: async () => {
      const res = await fetch("/api/eventos");
      if (!res.ok) throw new Error("Failed to fetch events");
      const json = await res.json();
      return json.eventos || [];
    },
    staleTime: 120_000,
    initialData: initialEventos,
  });

  return {
    eventos,
    loading,
    isFetching,
    error: error ? (error as Error).message || "Error fetching events." : null,
    refetch,
  };
}

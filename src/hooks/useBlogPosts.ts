"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { BlogPost } from "@/lib/axiosBlog";

type BlogData = {
  items: BlogPost[];
  nextPageToken: string | null;
};

export default function useBlogPosts(initialPosts: BlogPost[] = []) {
  const [pageToken, setPageToken] = useState<string | null>(null);
  const [prevPageTokens, setPrevPageTokens] = useState<string[]>([]);

  const { data, isLoading, isFetching } = useQuery<BlogData>({
    queryKey: ["blog", "posts", pageToken],
    queryFn: async () => {
      const res = await fetch(`/api/descargas${pageToken ? `?pageToken=${pageToken}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch blog posts");
      return res.json();
    },
    // 10 minutes stale
    staleTime: 600_000,
    initialData: { items: initialPosts, nextPageToken: null },
  });

  const posts = data?.items || [];
  const nextPageToken = data?.nextPageToken || null;
  const loading = isLoading || isFetching;

  const fetchPosts = (token: string | null = null, isNext: boolean = true) => {
    setPageToken(token);
    if (isNext && token) {
      setPrevPageTokens((prev) => [...prev, token]);
    } else if (!isNext) {
      setPrevPageTokens((prev) => prev.slice(0, -1));
    }
  };

  return { posts, nextPageToken, prevPageTokens, loading, fetchPosts };
}

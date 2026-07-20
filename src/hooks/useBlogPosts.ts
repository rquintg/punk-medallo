"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { BlogPost } from "@/lib/axiosBlog";

type BlogData = {
  items: BlogPost[];
  nextPageToken: string | null;
};

interface BlogPostsReturn {
  posts: BlogPost[];
  nextPageToken: string | null;
  prevPageTokens: string[];
  loading: boolean;
  fetchPosts: (token: string | null, isNext: boolean) => void;
}

export default function useBlogPosts(
  initialPosts: BlogPost[] = [],
  initialNextPageToken: string | null = null
): BlogPostsReturn {
  const [pageToken, setPageToken] = useState<string | null>(null);
  const [prevPageTokens, setPrevPageTokens] = useState<string[]>([]);
  const pendingNavRef = useRef<{ token: string | null; isNext: boolean } | null>(null);

  const { data, isLoading, isFetching } = useQuery<BlogData>({
    queryKey: ["blog", "posts", pageToken],
    queryFn: async () => {
      const url = `/api/descargas${pageToken ? `?pageToken=${pageToken}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch blog posts");
      return res.json() as Promise<BlogData>;
    },
    staleTime: 600_000, // 10 minutes
    ...(pageToken === null && {
      initialData: { items: initialPosts, nextPageToken: initialNextPageToken ?? null },
    }),
  });

  useEffect(() => {
    const pending = pendingNavRef.current;
    if (!pending) return;

    if (pending.isNext && pending.token) {
      setPrevPageTokens((prev) => [...prev, pending.token as string]);
    } else if (!pending.isNext) {
      setPrevPageTokens((prev) => prev.slice(0, -1));
    }

    pendingNavRef.current = null;

    // Scroll to top on pagination to show new content from the beginning
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0 });
    }
  }, [data]);

  const posts = data?.items ?? [];
  const nextPageToken = data?.nextPageToken ?? null;
  const loading = isLoading || isFetching;

  const fetchPosts = (token: string | null = null, isNext: boolean = true): void => {
    pendingNavRef.current = { token, isNext };
    setPageToken(token);
  };

  return { posts, nextPageToken, prevPageTokens, loading, fetchPosts };
}

"use client";

import useBlogPosts from "@/hooks/useBlogPosts";
import ButtonsPaginationBlog from "@/components/util/ButtonsPaginationBlog";
import SpinnerLoader from "@/components/util/SpinnerLoader";
import type { BlogPost } from "@/lib/axiosBlog";

interface DescargasContentProps {
  initialPosts?: BlogPost[];
  initialNextPageToken?: string | null;
}

export default function DescargasContent({
  initialPosts,
  initialNextPageToken,
}: DescargasContentProps) {
  const { posts, nextPageToken, prevPageTokens, loading, fetchPosts } = useBlogPosts(
    initialPosts ?? [],
    initialNextPageToken ?? null
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-white mb-8 pb-4 border-b-2 border-[#a40202] md:invisible">
        Descargar Musica
      </h2>

      {loading && (
        <div className="text-center my-5">
          <SpinnerLoader />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-[rgba(52,58,64,0.4)] p-6 rounded-lg border border-[#a40202]/30 backdrop-blur"
          >
            <h3 className="text-xl font-bold text-[#a40202] mb-4">{post.title}</h3>
            <div
              className="text-[#d0d0d0] leading-relaxed prose prose-invert prose-a:text-[#a40202] max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content ?? "" }}
            />
          </div>
        ))}
      </div>

      <ButtonsPaginationBlog
        nextPageToken={nextPageToken}
        prevPageTokens={prevPageTokens}
        fetchPosts={fetchPosts}
        loading={loading}
      />
    </div>
  );
}

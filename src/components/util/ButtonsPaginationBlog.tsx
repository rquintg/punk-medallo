"use client";

interface ButtonsPaginationBlogProps {
  nextPageToken: string | null;
  prevPageTokens: string[];
  fetchPosts: (pageToken: string | null, isNext: boolean) => void;
  loading: boolean;
}

export default function ButtonsPaginationBlog({
  nextPageToken,
  prevPageTokens,
  fetchPosts,
  loading,
}: ButtonsPaginationBlogProps) {
  const isPrevDisabled = prevPageTokens.length === 0 || loading;
  const isNextDisabled = !nextPageToken || loading;

  const handlePrev = (): void => {
    if (prevPageTokens.length > 1) {
      fetchPosts(prevPageTokens[prevPageTokens.length - 2], false);
    } else if (prevPageTokens.length === 1) {
      fetchPosts(null, false);
    }
  };

  const handleNext = (): void => {
    if (nextPageToken) {
      fetchPosts(nextPageToken, true);
    }
  };

  const buttonClassName =
    "px-[18px] py-2 rounded-md border-none bg-[#232323] text-[#ff0055] font-bold transition-opacity disabled:cursor-not-allowed enabled:cursor-pointer";

  return (
    <div className="flex justify-center gap-4 mt-6">
      <button
        onClick={handlePrev}
        disabled={isPrevDisabled}
        className={buttonClassName}
        style={{ opacity: isPrevDisabled ? 0.5 : 1 }}
      >
        Anterior
      </button>
      <button
        onClick={handleNext}
        disabled={isNextDisabled}
        className={buttonClassName}
        style={{ opacity: isNextDisabled ? 0.5 : 1 }}
      >
        Siguiente
      </button>
    </div>
  );
}

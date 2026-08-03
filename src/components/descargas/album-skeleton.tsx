export function AlbumCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg border border-neutral-800 bg-[#111]">
      <div className="aspect-square bg-neutral-800" />
      <div className="space-y-2 p-3.5">
        <div className="h-2.5 w-1/3 rounded bg-neutral-800" />
        <div className="h-4 w-2/3 rounded bg-neutral-800" />
        <div className="h-2.5 w-1/4 rounded bg-neutral-800" />
      </div>
    </div>
  );
}

export function AlbumGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <AlbumCardSkeleton key={index} />
      ))}
    </div>
  );
}

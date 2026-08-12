const ALTURAS = [
  "aspect-[3/4]",
  "aspect-square",
  "aspect-[4/3]",
  "aspect-[3/5]",
  "aspect-[16/10]",
];

export function FotosSkeletonItem({ index = 0 }: { index?: number }) {
  const altura = ALTURAS[index % ALTURAS.length];
  return (
    <div className="mb-4 break-inside-avoid overflow-hidden rounded-lg border border-neutral-800 bg-[#111] animate-pulse">
      <div className={`w-full ${altura} bg-neutral-800`} />
      <div className="space-y-2 p-3.5">
        <div className="h-2.5 w-2/3 rounded bg-neutral-800" />
        <div className="h-2.5 w-1/3 rounded bg-neutral-800" />
      </div>
    </div>
  );
}

export function FotosGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
      {Array.from({ length: count }, (_, index) => (
        <FotosSkeletonItem key={index} index={index} />
      ))}
    </div>
  );
}
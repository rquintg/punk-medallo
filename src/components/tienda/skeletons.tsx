export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col rounded-lg border border-neutral-800 bg-[#111]">
      <div className="aspect-square w-full rounded-t-lg bg-neutral-800" />
      <div className="flex flex-col gap-3 p-4">
        <div className="h-4 w-3/4 rounded bg-neutral-800" />
        <div className="h-5 w-1/3 rounded bg-neutral-800" />
        <div className="h-3 w-1/2 rounded bg-neutral-800" />
        <div className="mt-2 h-10 w-full rounded-md bg-neutral-800" />
      </div>
    </div>
  );
}

export function ProductGallerySkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="aspect-square w-full animate-pulse rounded-lg bg-neutral-800" />
      <div className="flex gap-3">
        <div className="h-20 w-20 animate-pulse rounded-md bg-neutral-800" />
        <div className="h-20 w-20 animate-pulse rounded-md bg-neutral-800" />
      </div>
    </div>
  );
}

export function ProductInfoSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6">
      <div>
        <div className="h-8 w-full rounded bg-neutral-800 lg:h-9" />
        <div className="mt-2 h-4 w-20 rounded bg-neutral-800" />
      </div>
      <div className="h-8 w-1/2 rounded bg-neutral-800" />
      <div className="flex items-center gap-2">
        <div className="h-2.5 w-2.5 rounded-full bg-neutral-800" />
        <div className="h-4 w-16 rounded bg-neutral-800" />
      </div>
      <div>
        <div className="mb-3 h-4 w-12 rounded bg-neutral-800" />
        <div className="flex flex-wrap gap-2">
          <div className="h-10 w-20 rounded-md bg-neutral-800" />
          <div className="h-10 w-20 rounded-md bg-neutral-800" />
          <div className="h-10 w-20 rounded-md bg-neutral-800" />
        </div>
      </div>
      <div>
        <div className="mb-3 h-4 w-12 rounded bg-neutral-800" />
        <div className="flex flex-wrap gap-2">
          <div className="h-10 w-10 rounded-md bg-neutral-800" />
          <div className="h-10 w-10 rounded-md bg-neutral-800" />
          <div className="h-10 w-10 rounded-md bg-neutral-800" />
          <div className="h-10 w-10 rounded-md bg-neutral-800" />
        </div>
      </div>
      <div>
        <div className="mb-3 h-4 w-16 rounded bg-neutral-800" />
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-l-md bg-neutral-800" />
            <div className="h-10 w-12 bg-neutral-800" />
            <div className="h-10 w-10 rounded-r-md bg-neutral-800" />
          </div>
          <div className="h-4 w-24 rounded bg-neutral-800" />
        </div>
      </div>
      <div className="h-12 w-full rounded-lg bg-neutral-800" />
      <div className="space-y-2 pt-6">
        <div className="h-4 w-full rounded bg-neutral-800" />
        <div className="h-4 w-5/6 rounded bg-neutral-800" />
      </div>
    </div>
  );
}

export function ProductFiltersSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 w-full rounded-lg bg-neutral-800" />
      <div>
        <div className="mb-3 h-3 w-16 rounded bg-neutral-800" />
        <div className="flex flex-col gap-1.5">
          <div className="h-8 w-full rounded-md bg-neutral-800" />
          <div className="h-8 w-full rounded-md bg-neutral-800" />
          <div className="h-8 w-full rounded-md bg-neutral-800" />
        </div>
      </div>
      <div>
        <div className="mb-3 h-3 w-12 rounded bg-neutral-800" />
        <div className="flex flex-col gap-1.5">
          <div className="h-8 w-full rounded-md bg-neutral-800" />
          <div className="h-8 w-full rounded-md bg-neutral-800" />
          <div className="h-8 w-full rounded-md bg-neutral-800" />
          <div className="h-8 w-full rounded-md bg-neutral-800" />
        </div>
      </div>
      <div>
        <div className="mb-3 h-3 w-10 rounded bg-neutral-800" />
        <div className="flex flex-col gap-1.5">
          <div className="h-8 w-full rounded-md bg-neutral-800" />
          <div className="h-8 w-full rounded-md bg-neutral-800" />
          <div className="h-8 w-full rounded-md bg-neutral-800" />
          <div className="h-8 w-full rounded-md bg-neutral-800" />
          <div className="h-8 w-full rounded-md bg-neutral-800" />
        </div>
      </div>
      <div>
        <div className="mb-3 h-3 w-12 rounded bg-neutral-800" />
        <div className="flex flex-col gap-1.5">
          <div className="h-8 w-full rounded-md bg-neutral-800" />
          <div className="h-8 w-full rounded-md bg-neutral-800" />
          <div className="h-8 w-full rounded-md bg-neutral-800" />
          <div className="h-8 w-full rounded-md bg-neutral-800" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function RelatedProductsSkeleton() {
  return (
    <section className="mt-16">
      <div className="mb-8 h-6 w-52 animate-pulse rounded bg-neutral-800" />
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

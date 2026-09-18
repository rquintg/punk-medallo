import { HeroSkeleton, ProximosSkeleton, DestacadosSkeleton, ArchivoSkeleton, ProductosSkeleton } from "@/components/home/skeletons";

export default function Loading() {
  return (
    <div>
      <HeroSkeleton />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="h-6 w-40 rounded bg-neutral-800 animate-pulse" />
        <div className="mt-6">
          <ProximosSkeleton />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <DestacadosSkeleton />
      </div>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="h-6 w-32 rounded bg-neutral-800 animate-pulse" />
        <div className="mt-6">
          <ArchivoSkeleton />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <ProductosSkeleton />
      </div>
    </div>
  );
}

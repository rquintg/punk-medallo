import { ProductFiltersSkeleton, ProductGridSkeleton } from '@/components/tienda/skeletons';

export default function TiendaLoading() {
  return (
    <div>
      <div className="mb-10 flex animate-pulse items-start justify-between gap-4">
        <div>
          <div className="h-9 w-32 rounded bg-neutral-800 md:h-10" />
          <div className="mt-2 h-5 w-96 rounded bg-neutral-800" />
        </div>
        <div className="h-10 w-10 rounded-full bg-neutral-800" />
      </div>

      <div className="mb-8">
        <ProductFiltersSkeleton />
      </div>

      <ProductGridSkeleton count={8} />
    </div>
  );
}

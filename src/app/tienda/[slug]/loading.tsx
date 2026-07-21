import { ProductGallerySkeleton, ProductInfoSkeleton } from '@/components/tienda/skeletons';

export default function ProductLoading() {
  return (
    <div>
      <div className="mb-6 h-4 w-64 animate-pulse rounded bg-neutral-800" />

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <div className="w-full lg:w-3/5">
          <ProductGallerySkeleton />
        </div>
        <div className="w-full lg:w-2/5">
          <ProductInfoSkeleton />
        </div>
      </div>
    </div>
  );
}

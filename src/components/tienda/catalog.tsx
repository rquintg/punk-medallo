import { Suspense } from 'react';
import Link from 'next/link';
import type { CategoriaInfo, Producto } from '@/features/tienda/types';
import type { PrecioLimites } from '@/features/tienda/services/products';
import { SearchBar } from './search-bar';
import { ProductFilters } from './product-filters';
import { MobileFilters } from './mobile-filters';
import { SortSelect } from './sort-select';
import { ProductFiltersSkeleton } from './skeletons';
import ProductCard from './product-card';
import { Pagination } from './pagination';

interface CatalogProps {
  categorias: CategoriaInfo[];
  productos: Producto[];
  total: number;
  page: number;
  totalPages: number;
  activeCategoria?: string | null;
  hasFilters: boolean;
  destacados?: Producto[];
  ofertas?: Producto[];
  precioLimites: PrecioLimites;
}

export function Catalog({
  categorias,
  productos,
  total,
  page,
  totalPages,
  activeCategoria = null,
  hasFilters,
  destacados = [],
  ofertas = [],
  precioLimites,
}: CatalogProps) {
  const showDestacados = !hasFilters && destacados.length > 0;
  const showOfertas = !hasFilters && ofertas.length > 0;

  return (
    <div className="lg:flex lg:gap-8">
      <aside className="hidden w-[250px] shrink-0 lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
          <Suspense fallback={<ProductFiltersSkeleton />}>
            <SearchBar className="mb-6" />
            <ProductFilters
              orientation="sidebar"
              categorias={categorias}
              activeCategoria={activeCategoria}
              precioLimites={precioLimites}
            />
          </Suspense>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {showOfertas && (
          <section className="mb-10">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Ofertas</h2>
              <Link
                href="/tienda/ofertas"
                className="text-xs font-medium text-emerald-400 transition-colors hover:text-emerald-300"
              >
                Ver todas
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {ofertas.slice(0, 4).map((producto) => (
                <ProductCard key={producto.id} product={producto} />
              ))}
            </div>
          </section>
        )}

        {showDestacados && (
          <section className="mb-10">
            <h2 className="mb-4 text-lg font-bold text-white">Lo más pedido</h2>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {destacados.slice(0, 4).map((producto) => (
                <ProductCard key={producto.id} product={producto} />
              ))}
            </div>
          </section>
        )}

        <div className="mb-4 lg:hidden">
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="lg:hidden">
            <Suspense fallback={null}>
              <MobileFilters
                categorias={categorias}
                activeCategoria={activeCategoria}
                precioLimites={precioLimites}
              />
            </Suspense>
          </div>

          <Suspense fallback={null}>
            <SortSelect />
          </Suspense>

          <p className="text-sm text-neutral-400">
            {total} resultado{total !== 1 ? 's' : ''}
          </p>
        </div>

        {productos.length === 0 ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <p className="text-lg text-neutral-500">
              No hay productos que coincidan con los filtros seleccionados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {productos.map((producto) => (
              <ProductCard key={producto.id} product={producto} />
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} />
      </div>
    </div>
  );
}

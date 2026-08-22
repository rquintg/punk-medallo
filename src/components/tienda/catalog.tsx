import { Suspense } from 'react';
import Link from 'next/link';
import { Percent } from 'lucide-react';
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
  masPedidos?: Producto[];
  mostrarMasPedidos?: boolean;
  mostrarOfertas?: boolean;
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
  masPedidos = [],
  mostrarMasPedidos = true,
  mostrarOfertas = true,
  precioLimites,
}: CatalogProps) {
  const showDestacados = !hasFilters && destacados.length > 0;
  const showOfertas = mostrarOfertas && !hasFilters && ofertas.length > 0;
  const showMasPedidos = mostrarMasPedidos && !hasFilters && masPedidos.length > 0;

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
          <section className="mb-10 rounded-xl border border-emerald-900/30 bg-emerald-950/20 p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <Percent size={14} />
                </span>
                <h2 className="text-lg font-bold text-white">Ofertas</h2>
                <span className="hidden rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-bold text-white sm:inline">
                  Hasta 50% OFF
                </span>
              </div>
              <Link
                href="/tienda/ofertas"
                className="shrink-0 text-xs font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
              >
                Ver todas →
              </Link>
            </div>
            {/* Desktop: grid */}
            <div className="hidden gap-4 sm:gap-6 lg:grid lg:grid-cols-4">
              {ofertas.slice(0, 4).map((producto) => (
                <ProductCard key={producto.id} product={producto} />
              ))}
            </div>
            {/* Mobile: shelf carousel con peek */}
            <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:thin] lg:hidden snap-x snap-mandatory sm:-mx-6 sm:px-6">
              {ofertas.slice(0, 4).map((producto) => (
                <div key={producto.id} className="w-[200px] shrink-0 snap-start sm:w-[240px]">
                  <ProductCard product={producto} />
                </div>
              ))}
            </div>
          </section>
        )}

        {showMasPedidos && (
          <section className="mb-10">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Lo mas pedido</h2>
              <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Top 30 dias
              </span>
            </div>
            <div className="hidden gap-4 sm:gap-6 lg:grid lg:grid-cols-4">
              {masPedidos.slice(0, 4).map((producto) => (
                <ProductCard key={producto.id} product={producto} />
              ))}
            </div>
            <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:thin] lg:hidden snap-x snap-mandatory sm:-mx-6 sm:px-6">
              {masPedidos.slice(0, 4).map((producto) => (
                <div key={producto.id} className="w-[200px] shrink-0 snap-start sm:w-[240px]">
                  <ProductCard product={producto} />
                </div>
              ))}
            </div>
          </section>
        )}

        {showDestacados && !showMasPedidos && (
          <section className="mb-10">
            <h2 className="mb-4 text-lg font-bold text-white">Lo mas pedido</h2>
            <div className="hidden grid-cols-2 gap-4 sm:gap-6 lg:grid lg:grid-cols-4">
              {destacados.slice(0, 4).map((producto) => (
                <ProductCard key={producto.id} product={producto} />
              ))}
            </div>
            <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:thin] lg:hidden snap-x snap-mandatory">
              {destacados.slice(0, 4).map((producto) => (
                <div key={producto.id} className="w-[200px] shrink-0 snap-start sm:w-[240px]">
                  <ProductCard product={producto} />
                </div>
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
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
            <p className="text-lg text-neutral-500">
              No hay productos que coincidan con los filtros seleccionados.
            </p>
            <p className="text-sm text-neutral-600">Proba ajustando los filtros o borra todo para ver mas productos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
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

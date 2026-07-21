import type { Metadata } from 'next';
import { Suspense } from 'react';
import type { Categoria, Talla, Genero } from '@/features/tienda/types';
import { getProductos } from '@/features/tienda/services/products';
import { breadcrumbListJsonLd, SITE_URL, TIENDA_URL } from '@/features/tienda/utils/seo';
import { SearchBar } from '@/components/tienda/search-bar';
import { ProductFilters } from '@/components/tienda/product-filters';
import { FilterDrawer } from '@/components/tienda/filter-drawer';
import { SortSelect } from '@/components/tienda/sort-select';
import { ProductFiltersSkeleton } from '@/components/tienda/skeletons';
import ProductCard from '@/components/tienda/product-card';
import CartDrawer from '@/components/tienda/cart-drawer';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Tienda - Punk Medallo',
  description:
    'Camisetas, parches, pins y accesorios punk. Merch oficial de Punk Medallo. Envíos a toda Colombia.',
  openGraph: {
    title: 'Tienda - Punk Medallo',
    description:
      'Camisetas, parches, pins y accesorios punk. Merch oficial de Punk Medallo.',
    url: TIENDA_URL,
    images: [
      {
        url: `${SITE_URL}/logo_punk_medallo.jpg`,
        width: 1200,
        height: 630,
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tienda - Punk Medallo',
    description:
      'Camisetas, parches, pins y accesorios punk. Merch oficial de Punk Medallo.',
    images: [`${SITE_URL}/logo_punk_medallo.jpg`],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: TIENDA_URL,
  },
};

const PRICE_RANGES: Record<string, { min: number; max: number }> = {
  barato: { min: 0, max: 50000 },
  medio: { min: 50000, max: 80000 },
  caro: { min: 80000, max: Infinity },
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TiendaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const categoria = (params.categoria as string) ?? 'all';
  const genero = (params.genero as string) ?? 'all';
  const talla = (params.talla as string) ?? 'all';
  const precio = (params.precio as string) ?? 'all';
  const sort = (params.sort as string) ?? 'relevancia';

  let productos = await getProductos();

  if (categoria !== 'all') {
    productos = productos.filter((p) => p.categoria === (categoria as Categoria));
  }

  if (genero !== 'all') {
    productos = productos.filter((p) => p.genero === (genero as Genero));
  }

  if (talla !== 'all') {
    productos = productos.filter((p) =>
      p.tallasDisponibles.includes(talla as Talla),
    );
  }

  if (precio !== 'all') {
    const range = PRICE_RANGES[precio];
    if (range) {
      productos = productos.filter(
        (p) => p.precio >= range.min && p.precio <= range.max,
      );
    }
  }

  switch (sort) {
    case 'precio-asc':
      productos.sort((a, b) => a.precio - b.precio);
      break;
    case 'precio-desc':
      productos.sort((a, b) => b.precio - a.precio);
      break;
    case 'nombre-asc':
      productos.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
      break;
    case 'nombre-desc':
      productos.sort((a, b) => b.nombre.localeCompare(a.nombre, 'es'));
      break;
  }

  const breadcrumbSegments = [{ label: 'Tienda' }];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListJsonLd(breadcrumbSegments)) }}
      />

      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white md:text-4xl">Tienda</h1>
          <p className="mt-2 text-neutral-400">
            Camisetas, accesorios y merch oficial de punk medallo.
          </p>
        </div>
        <CartDrawer />
      </div>

      <div className="lg:flex lg:gap-8">
        <aside className="hidden w-[250px] shrink-0 lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <Suspense fallback={<ProductFiltersSkeleton />}>
              <SearchBar className="mb-6" />
              <ProductFilters orientation="sidebar" />
            </Suspense>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-4 lg:hidden">
            <Suspense fallback={null}>
              <SearchBar />
            </Suspense>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="lg:hidden">
              <Suspense fallback={null}>
                <FilterDrawer>
                  <ProductFilters orientation="drawer" />
                </FilterDrawer>
              </Suspense>
            </div>

            <Suspense fallback={null}>
              <SortSelect />
            </Suspense>

            <p className="text-sm text-neutral-400">
              {productos.length} resultado{productos.length !== 1 ? 's' : ''}
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
        </div>
      </div>
    </>
  );
}

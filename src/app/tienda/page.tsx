import type { Metadata } from 'next';
import { Suspense } from 'react';
import type { Genero, Talla } from '@/features/tienda/types';
import { getProductosFiltrados } from '@/features/tienda/services/products';
import { getCategorias } from '@/features/tienda/services/categorias';
import { breadcrumbListJsonLd, SITE_URL, TIENDA_URL } from '@/features/tienda/utils/seo';
import { SearchBar } from '@/components/tienda/search-bar';
import { ProductFilters } from '@/components/tienda/product-filters';
import { FilterDrawer } from '@/components/tienda/filter-drawer';
import { SortSelect } from '@/components/tienda/sort-select';
import { ProductFiltersSkeleton } from '@/components/tienda/skeletons';
import ProductCard from '@/components/tienda/product-card';
import CartDrawer from '@/components/tienda/cart-drawer';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Tienda',
  description:
    'Camisetas y accesorios punk. Merch oficial de Punk Medallo. Envíos a toda Colombia.',
  openGraph: {
    title: 'Tienda - Punk Medallo',
    description:
      'Camisetas y accesorios punk. Merch oficial de Punk Medallo.',
    url: TIENDA_URL,
    type: 'website',
    locale: 'es_CO',
    siteName: 'Punk Medallo',
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
      'Camisetas y accesorios punk. Merch oficial de Punk Medallo.',
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
  const categoriaId = (params.categoria_id as string) ?? '';
  const genero = (params.genero as string) ?? '';
  const talla = (params.talla as string) ?? '';
  const precioKey = (params.precio as string) ?? '';
  const sort = (params.sort as string) ?? 'relevancia';

  const filters: Record<string, unknown> = {}
  if (categoriaId) filters.categoria_id = categoriaId
  if (genero) filters.genero = genero as Genero
  if (talla) filters.talla = talla as Talla
  if (precioKey && PRICE_RANGES[precioKey]) {
    filters.precio_min = PRICE_RANGES[precioKey].min
    if (PRICE_RANGES[precioKey].max !== Infinity) {
      filters.precio_max = PRICE_RANGES[precioKey].max
    }
  }

  const [productos, categorias] = await Promise.all([
    getProductosFiltrados(filters),
    getCategorias(),
  ])

  const sortFn = (a: typeof productos[number], b: typeof productos[number]) => {
    switch (sort) {
      case 'precio-asc': return a.precio - b.precio
      case 'precio-desc': return b.precio - a.precio
      case 'nombre-asc': return a.nombre.localeCompare(b.nombre, 'es')
      case 'nombre-desc': return b.nombre.localeCompare(a.nombre, 'es')
      default:
        if (a.destacado !== b.destacado) return a.destacado ? -1 : 1
        return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
    }
  }
  const sorted = [...productos].sort(sortFn)

  const breadcrumbSegments = [{ label: 'Tienda' }];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListJsonLd(breadcrumbSegments)) }}
      />

      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
              <ProductFilters orientation="sidebar" categorias={categorias} />
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
                  <ProductFilters orientation="drawer" categorias={categorias} />
                </FilterDrawer>
              </Suspense>
            </div>

            <Suspense fallback={null}>
              <SortSelect />
            </Suspense>

            <p className="text-sm text-neutral-400">
              {sorted.length} resultado{sorted.length !== 1 ? 's' : ''}
            </p>
          </div>

          {sorted.length === 0 ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <p className="text-lg text-neutral-500">
                No hay productos que coincidan con los filtros seleccionados.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sorted.map((producto) => (
                <ProductCard key={producto.id} product={producto} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

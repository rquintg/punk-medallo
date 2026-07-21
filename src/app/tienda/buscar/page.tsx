import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getProductosByQuery } from '@/features/tienda/services/products';
import { breadcrumbListJsonLd, SITE_URL, TIENDA_URL } from '@/features/tienda/utils/seo';
import { Breadcrumbs } from '@/components/tienda/breadcrumbs';
import { SearchBar } from '@/components/tienda/search-bar';
import ProductCard from '@/components/tienda/product-card';
import CartDrawer from '@/components/tienda/cart-drawer';

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const q = (typeof params.q === 'string' ? params.q : '').trim();

  const title = q
    ? `"${q}" - Buscar en Tienda Punk Medallo`
    : 'Buscar - Tienda Punk Medallo';

  return {
    title,
    description: q
      ? `Resultados de búsqueda para "${q}" en la tienda Punk Medallo.`
      : 'Busca productos en la tienda Punk Medallo.',
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: `${TIENDA_URL}/buscar`,
    },
    openGraph: {
      title,
      url: `${TIENDA_URL}/buscar`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
    },
  };
}

export default async function BuscarPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = (typeof params.q === 'string' ? params.q : '').trim();

  const productos = q ? await getProductosByQuery(q) : [];

  const breadcrumbSegments = [
    { label: 'Tienda', href: '/tienda' },
    { label: q ? `Buscar: "${q}"` : 'Buscar' },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbListJsonLd(breadcrumbSegments)),
        }}
      />

      <div className="mb-6 flex items-start justify-between gap-4">
        <Breadcrumbs segments={breadcrumbSegments} />
        <CartDrawer />
      </div>

      <h1 className="mb-6 text-3xl font-bold text-white md:text-4xl">Buscar productos</h1>

      <div className="mb-8">
        <Suspense fallback={null}>
          <SearchBar />
        </Suspense>
      </div>

      {!q ? (
        <p className="text-neutral-500">Escribe algo para empezar a buscar.</p>
      ) : productos.length === 0 ? (
        <p className="text-neutral-500">
          No hay productos que coincidan con{' '}
          <span className="font-medium text-neutral-300">&quot;{q}&quot;</span>
        </p>
      ) : (
        <>
          <p className="mb-6 text-sm text-neutral-400">
            {productos.length} resultado{productos.length !== 1 ? 's' : ''} para{' '}
            <span className="font-medium text-neutral-300">&quot;{q}&quot;</span>
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {productos.map((producto) => (
              <ProductCard key={producto.id} product={producto} />
            ))}
          </div>
        </>
      )}
    </>
  );
}

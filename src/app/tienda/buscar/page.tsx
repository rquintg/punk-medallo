import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getProductosPage, PAGE_SIZE, type ProductoOrden } from '@/features/tienda/services/products';
import { breadcrumbListJsonLd, ogImageActual, TIENDA_URL } from '@/features/tienda/utils/seo';
import { Breadcrumbs } from '@/components/tienda/breadcrumbs';
import { SearchBar } from '@/components/tienda/search-bar';
import { SortSelect } from '@/components/tienda/sort-select';
import { Pagination } from '@/components/tienda/pagination';
import ProductCard from '@/components/tienda/product-card';
import CartDrawer from '@/components/tienda/cart-drawer';

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const [params, ogImage] = await Promise.all([searchParams, ogImageActual()]);
  const q = (typeof params.q === 'string' ? params.q : '').trim();

  const title = q
    ? `"${q}" - Buscar en Tienda`
    : 'Buscar en Tienda';

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
      description: q
        ? `Resultados de búsqueda para "${q}" en la tienda Punk Medallo.`
        : 'Busca productos en la tienda Punk Medallo.',
      url: `${TIENDA_URL}/buscar`,
      type: 'website',
      locale: 'es_CO',
      siteName: 'Punk Medallo',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          type: 'image/jpeg',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: q
        ? `Resultados de búsqueda para "${q}" en la tienda Punk Medallo.`
        : 'Busca productos en la tienda Punk Medallo.',
      images: [ogImage],
    },
  };
}

export default async function BuscarPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const qRaw = (typeof params.q === 'string' ? params.q : '').trim().slice(0, 80);
  const sanitizedQ = qRaw.replace(/%/g, '').replace(/,/g, '').trim()
  const page = Math.max(1, Number(params.page) || 1)
  const sort = (params.sort as ProductoOrden) ?? 'relevancia'

  const pageData = sanitizedQ ? await getProductosPage({ q: sanitizedQ }, sort, page, PAGE_SIZE) : { productos: [], total: 0 }
  const productos = pageData.productos
  const totalPages = Math.max(1, Math.ceil(pageData.total / PAGE_SIZE))

  const breadcrumbSegments = [
    { label: 'Tienda', href: '/tienda' },
    { label: sanitizedQ ? `Buscar: "${sanitizedQ}"` : 'Buscar' },
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

      {!sanitizedQ ? (
        <p className="text-neutral-500">Escribe algo para empezar a buscar.</p>
      ) : productos.length === 0 ? (
        <p className="text-neutral-500">
          No hay productos que coincidan con{' '}
          <span className="font-medium text-neutral-300">&quot;{sanitizedQ}&quot;</span>
        </p>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Suspense fallback={null}>
              <SortSelect />
            </Suspense>
            <p className="text-sm text-neutral-400">
              {pageData.total} resultado{pageData.total !== 1 ? 's' : ''} para{' '}
              <span className="font-medium text-neutral-300">&quot;{sanitizedQ}&quot;</span>
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {productos.map((producto) => (
              <ProductCard key={producto.id} product={producto} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} />
        </>
      )}
    </>
  );
}

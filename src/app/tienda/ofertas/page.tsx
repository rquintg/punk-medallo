import type { Metadata } from 'next';
import type { Genero, ProductoFilters, Talla } from '@/features/tienda/types';
import {
  getProductosPage,
  getPrecioLimites,
  PAGE_SIZE,
  type ProductoOrden,
} from '@/features/tienda/services/products';
import { getCategorias } from '@/features/tienda/services/categorias';
import { breadcrumbListJsonLd, ogImageActual, TIENDA_URL } from '@/features/tienda/utils/seo';
import { parsePrecios } from '@/features/tienda/utils/precios';
import { Catalog } from '@/components/tienda/catalog';
import CartDrawer from '@/components/tienda/cart-drawer';

export const revalidate = 60;

const URL_OFERTAS = `${TIENDA_URL}/ofertas`;

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await ogImageActual();
  return {
    title: 'Ofertas',
    description:
      'Productos en oferta de Punk Medallo. Camisetas y accesorios punk con descuento. Envíos a toda Colombia.',
    openGraph: {
      title: 'Ofertas - Punk Medallo',
      description: 'Productos en oferta del merch oficial de Punk Medallo.',
      url: URL_OFERTAS,
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
      title: 'Ofertas - Punk Medallo',
      description: 'Productos en oferta del merch oficial de Punk Medallo.',
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: URL_OFERTAS,
    },
  };
}

interface OfertasPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OfertasPage({ searchParams }: OfertasPageProps) {
  const params = await searchParams;
  const generos = ((params.genero as string) ?? '').split(',').map((g) => g.trim()).filter(Boolean) as Genero[];
  const tallas = ((params.talla as string) ?? '').split(',').map((t) => t.trim()).filter(Boolean) as Talla[];
  const rangoPrecio = parsePrecios(params);
  const sort = (params.sort as ProductoOrden) ?? 'relevancia';
  const page = Math.max(1, Number(params.page) || 1);

  const [categorias, precioLimites] = await Promise.all([getCategorias(), getPrecioLimites()]);

  const filters: ProductoFilters = { oferta: true }
  if (generos.length) filters.generos = generos
  if (tallas.length) filters.tallas = tallas
  if (rangoPrecio.min !== undefined) filters.precio_min = rangoPrecio.min
  if (rangoPrecio.max !== undefined) filters.precio_max = rangoPrecio.max

  const pageData = await getProductosPage(filters, sort, page, PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(pageData.total / PAGE_SIZE));

  const breadcrumbSegments = [
    { label: 'Tienda', href: TIENDA_URL },
    { label: 'Ofertas' },
  ];

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: pageData.productos.map((producto, index) => ({
      '@type': 'ListItem',
      position: (page - 1) * PAGE_SIZE + index + 1,
      url: `${TIENDA_URL}/${producto.slug}`,
      name: producto.nombre,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListJsonLd(breadcrumbSegments)) }}
      />
      {pageData.productos.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}

      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white md:text-4xl">Ofertas</h1>
          <p className="mt-2 text-neutral-400">
            Productos con descuento del merch oficial de Punk Medallo.
          </p>
        </div>
        <CartDrawer />
      </div>

      <Catalog
        categorias={categorias}
        productos={pageData.productos}
        total={pageData.total}
        page={page}
        totalPages={totalPages}
        hasFilters
        precioLimites={precioLimites}
      />
    </>
  );
}
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getProductoBySlug, getProductosFiltrados } from '@/features/tienda/services/products';

export const revalidate = 60
import { breadcrumbListJsonLd, productJsonLd, SITE_URL, TIENDA_URL } from '@/features/tienda/utils/seo';
import { Breadcrumbs } from '@/components/tienda/breadcrumbs';
import ProductClient from './product-client';
import { RelatedProducts } from '@/components/tienda/related-products';
import { RelatedProductsSkeleton } from '@/components/tienda/skeletons';
import CartDrawer from '@/components/tienda/cart-drawer';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const productos = await getProductosFiltrados();
  return productos.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const producto = await getProductoBySlug(slug);

  if (!producto) return {};

  const imageUrl = producto.imagenes[0]?.url ?? `${SITE_URL}/logo_punk_medallo.jpg`;
  const title = `${producto.nombre} - Tienda`;

  return {
    title,
    description: producto.descripcion.slice(0, 160),
    openGraph: {
      title,
      description: producto.descripcion.slice(0, 160),
      url: `${TIENDA_URL}/${producto.slug}`,
      type: 'website',
      locale: 'es_CO',
      siteName: 'Punk Medallo',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: producto.imagenes[0]?.alt ?? producto.nombre,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: producto.descripcion.slice(0, 160),
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `${TIENDA_URL}/${producto.slug}`,
    },
    other: {
      'product:price:amount': String(producto.precio),
      'product:price:currency': 'COP',
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const producto = await getProductoBySlug(slug);

  if (!producto) notFound();

  const breadcrumbSegments = [
    { label: 'Tienda', href: '/tienda' },
    ...(producto.categoria
      ? [{
          label: producto.categoria.nombre,
          href: `/tienda?categoria_id=${producto.categoria_id}`,
        }]
      : []),
    { label: producto.nombre },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(producto)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListJsonLd(breadcrumbSegments)) }}
      />

      <div className="mb-6 flex items-start justify-between gap-4">
        <Breadcrumbs segments={breadcrumbSegments} />
        <CartDrawer />
      </div>

      <ProductClient producto={producto} />

      <Suspense fallback={<RelatedProductsSkeleton />}>
        <RelatedProducts
          categoriaId={producto.categoria_id}
          excludeId={producto.id}
        />
      </Suspense>
    </>
  );
}

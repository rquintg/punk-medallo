import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getProductoBySlug, getProductos } from '@/features/tienda/services/products';
import { breadcrumbListJsonLd, productJsonLd, SITE_URL, TIENDA_URL } from '@/features/tienda/utils/seo';
import { Breadcrumbs } from '@/components/tienda/breadcrumbs';
import { ProductGallery } from '@/components/tienda/product-gallery';
import { ProductInfo } from '@/components/tienda/product-info';
import { RelatedProducts } from '@/components/tienda/related-products';
import { ProductGallerySkeleton, ProductInfoSkeleton, RelatedProductsSkeleton } from '@/components/tienda/skeletons';
import CartDrawer from '@/components/tienda/cart-drawer';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const productos = await getProductos();
  return productos.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const producto = await getProductoBySlug(slug);

  if (!producto) return {};

  const imageUrl = producto.imagenes[0]?.url ?? `${SITE_URL}/logo_punk_medallo.jpg`;
  const title = `${producto.nombre} - Tienda Punk Medallo`;

  return {
    title,
    description: producto.descripcion.slice(0, 160),
    openGraph: {
      title,
      description: producto.descripcion.slice(0, 160),
      url: `${TIENDA_URL}/${producto.slug}`,
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
    {
      label: producto.categoria === 'camisetas' ? 'Camisetas' : 'Accesorios',
      href: `/tienda?categoria=${producto.categoria}`,
    },
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

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <div className="w-full lg:w-3/5">
          <Suspense fallback={<ProductGallerySkeleton />}>
            <ProductGallery imagenes={producto.imagenes} nombre={producto.nombre} />
          </Suspense>
        </div>

        <div className="w-full lg:w-2/5">
          <Suspense fallback={<ProductInfoSkeleton />}>
            <ProductInfo producto={producto} />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<RelatedProductsSkeleton />}>
        <RelatedProducts
          categoria={producto.categoria}
          excludeId={producto.id}
        />
      </Suspense>
    </>
  );
}

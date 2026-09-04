import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getProductoBySlug, getProductosFiltrados } from '@/features/tienda/services/products';

export const revalidate = 60
import { getTiendaConfig } from '@/features/tienda/services/tienda-config';
import { breadcrumbListJsonLd, productJsonLd, ogImageActual, TIENDA_URL } from '@/features/tienda/utils/seo';
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
  const cfg = await getTiendaConfig().catch(() => null as unknown as { tiendaActiva: boolean })
  if (cfg && !cfg.tiendaActiva) return { robots: { index: false, follow: false } }
  const [{ slug }, logoOg] = await Promise.all([params, ogImageActual()]);
  const producto = await getProductoBySlug(slug);

  if (!producto) return {};

  const imageUrl = producto.imagenes[0]?.url ?? logoOg;
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
  const [producto, tiendaCfg] = await Promise.all([getProductoBySlug(slug), getTiendaConfig()]);

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
    <div className="mx-auto max-w-6xl px-4 pt-20 pb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            productJsonLd(producto, {
              shippingMin: tiendaCfg.envioTarifaAntioquia,
              shippingMax: tiendaCfg.envioTarifaResto,
            }),
          ),
        }}
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
    </div>
  );
}

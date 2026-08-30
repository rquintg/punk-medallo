import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Genero, ProductoFilters, Talla } from '@/features/tienda/types';
import {
  getProductosPage,
  getProductosDestacados,
  getProductosEnOferta,
  getProductosMasPedidos,
  getPrecioLimites,
  PAGE_SIZE,
  type ProductoOrden,
} from '@/features/tienda/services/products';
import { getTiendaConfig } from '@/features/tienda/services/tienda-config';
import { getCategorias } from '@/features/tienda/services/categorias';
import { breadcrumbListJsonLd, ogImageActual, TIENDA_URL } from '@/features/tienda/utils/seo';
import { parsePrecios } from '@/features/tienda/utils/precios';
import { Catalog } from '@/components/tienda/catalog';
import CartDrawer from '@/components/tienda/cart-drawer';

export const revalidate = 60;

interface CategoriaPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateStaticParams() {
  const categorias = await getCategorias();
  return categorias.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: CategoriaPageProps): Promise<Metadata> {
  const [{ slug }, ogImage] = await Promise.all([params, ogImageActual()]);
  const categorias = await getCategorias();
  const categoria = categorias.find((c) => c.slug === slug);
  if (!categoria) return {};

  const url = `${TIENDA_URL}/categoria/${categoria.slug}`;

  return {
    title: `${categoria.nombre} - Tienda`,
    description: `Compra ${categoria.nombre.toLowerCase()} de Punk Medallo. Merch oficial punk con envíos a toda Colombia.`,
    openGraph: {
      title: `${categoria.nombre} - Punk Medallo`,
      description: `Compra ${categoria.nombre.toLowerCase()} de Punk Medallo.`,
      url,
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
      title: `${categoria.nombre} - Punk Medallo`,
      description: `Compra ${categoria.nombre.toLowerCase()} de Punk Medallo.`,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function CategoriaPage({
  params,
  searchParams,
}: CategoriaPageProps) {
  const [{ slug }, params2] = await Promise.all([params, searchParams]);
  const categorias = await getCategorias();
  const categoria = categorias.find((c) => c.slug === slug);
  if (!categoria) notFound();

  const generos = ((params2.genero as string) ?? '').split(',').map((g) => g.trim()).filter(Boolean) as Genero[];
  const tallas = ((params2.talla as string) ?? '').split(',').map((t) => t.trim()).filter(Boolean) as Talla[];
  const rangoPrecio = parsePrecios(params2);
  const oferta = params2.oferta === '1';
  const sort = (params2.sort as ProductoOrden) ?? 'relevancia';
  const page = Math.max(1, Number(params2.page) || 1);

  const filters: ProductoFilters = { categoria_id: categoria.id }
  if (generos.length) filters.generos = generos
  if (tallas.length) filters.tallas = tallas
  if (oferta) filters.oferta = true
  if (rangoPrecio.min !== undefined) filters.precio_min = rangoPrecio.min
  if (rangoPrecio.max !== undefined) filters.precio_max = rangoPrecio.max

  const hasFilters = Boolean(
    generos.length || tallas.length || rangoPrecio.min !== undefined || rangoPrecio.max !== undefined || oferta,
  );

  const [tiendaConfig, precioLimites] = await Promise.all([getTiendaConfig(), getPrecioLimites()]);

  const [pageData, destacados, ofertas, masPedidos] = await Promise.all([
    getProductosPage(filters, sort, page, PAGE_SIZE),
    hasFilters ? Promise.resolve([]) : getProductosDestacados(),
    tiendaConfig.mostrarOfertas && !hasFilters ? getProductosEnOferta(4) : Promise.resolve([]),
    tiendaConfig.mostrarMasPedidos && !hasFilters ? getProductosMasPedidos(4, 30) : Promise.resolve([]),
  ]);

  const totalPages = Math.max(1, Math.ceil(pageData.total / PAGE_SIZE));

  const breadcrumbSegments = [
    { label: 'Tienda', href: TIENDA_URL },
    { label: categoria.nombre },
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
    <div className="min-h-screen bg-[#181818]">
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

      <section className="border-b border-neutral-800 bg-[#101010]">
        <div className="mx-auto max-w-6xl px-4 pt-24 pb-12 md:pt-28 md:pb-16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#dc2626]">Punk Medallo — Tienda</p>
              <h1 className="mt-3 text-5xl font-bold uppercase leading-none tracking-tight text-white md:text-7xl">
                {categoria.nombre.split(' ')[0]} <span className="text-[#dc2626]">{categoria.nombre.split(' ').slice(1).join(' ') || ''}</span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-400 md:text-base">
                {categoria.descripcion || `Compra ${categoria.nombre.toLowerCase()} de Punk Medallo. Envios a toda Colombia.`}
              </p>
            </div>
            <div className="shrink-0">
              <CartDrawer />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Catalog
          categorias={categorias}
          productos={pageData.productos}
          total={pageData.total}
          page={page}
          totalPages={totalPages}
          activeCategoria={categoria.slug}
          hasFilters={hasFilters}
          destacados={destacados}
          ofertas={ofertas}
          masPedidos={masPedidos}
          mostrarMasPedidos={tiendaConfig.mostrarMasPedidos}
          mostrarOfertas={tiendaConfig.mostrarOfertas}
          precioLimites={precioLimites}
        />
      </main>
    </div>
  );
}

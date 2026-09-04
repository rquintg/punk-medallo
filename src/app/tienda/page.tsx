import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
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

export async function generateMetadata(): Promise<Metadata> {
  const cfg = await getTiendaConfig().catch(() => null as unknown as { tiendaActiva: boolean })
  if (cfg && !cfg.tiendaActiva) return { robots: { index: false, follow: false } }
  const ogImage = await ogImageActual();
  return {
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
          url: ogImage,
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
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: TIENDA_URL,
    },
  };
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TiendaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const categoriaId = (params.categoria_id as string) ?? '';
  const generos = ((params.genero as string) ?? '').split(',').map((g) => g.trim()).filter(Boolean) as Genero[];
  const tallas = ((params.talla as string) ?? '').split(',').map((t) => t.trim()).filter(Boolean) as Talla[];
  const rangoPrecio = parsePrecios(params);
  const oferta = params.oferta === '1';
  const sort = (params.sort as ProductoOrden) ?? 'relevancia';
  const page = Math.max(1, Number(params.page) || 1);

  const [categorias, precioLimites, tiendaConfig] = await Promise.all([getCategorias(), getPrecioLimites(), getTiendaConfig()]);

  if (categoriaId) {
    const categoria = categorias.find((c) => c.id === categoriaId);
    if (categoria) {
      const url = new URL(`${TIENDA_URL}/categoria/${categoria.slug}`);
      const keep = new URLSearchParams();
      for (const [key, value] of Object.entries({
        genero: generos.join(','),
        talla: tallas.join(','),
        precio_min: rangoPrecio.min?.toString() ?? '',
        precio_max: rangoPrecio.max?.toString() ?? '',
        oferta: oferta ? '1' : '',
        sort,
      })) {
        if (value) keep.set(key, value);
      }
      const qs = keep.toString();
      redirect(qs ? `${url.pathname}?${qs}` : url.pathname);
    }
  }

  const filters: ProductoFilters = {}
  if (generos.length) filters.generos = generos
  if (tallas.length) filters.tallas = tallas
  if (oferta) filters.oferta = true
  if (rangoPrecio.min !== undefined) filters.precio_min = rangoPrecio.min
  if (rangoPrecio.max !== undefined) filters.precio_max = rangoPrecio.max

  const hasFilters = Boolean(
    generos.length || tallas.length || rangoPrecio.min !== undefined || rangoPrecio.max !== undefined || oferta,
  );

  const [pageData, destacados, ofertas, masPedidos] = await Promise.all([
    getProductosPage(filters, sort, page, PAGE_SIZE),
    hasFilters ? Promise.resolve([]) : getProductosDestacados(),
    tiendaConfig.mostrarOfertas && !hasFilters ? getProductosEnOferta(4) : Promise.resolve([]),
    tiendaConfig.mostrarMasPedidos && !hasFilters ? getProductosMasPedidos(4, 30) : Promise.resolve([]),
  ]);

  const totalPages = Math.max(1, Math.ceil(pageData.total / PAGE_SIZE));

  const breadcrumbSegments = [{ label: 'Tienda' }];

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
                La <span className="text-[#dc2626]">Tienda</span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-400 md:text-base">
                Camisetas, accesorios y merch oficial de punk medallo. Envios a toda Colombia.
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

import { precioConDescuento } from '@/lib/precio';
import { getTiendaConfig } from '@/features/tienda/services/tienda-config';

export const SITE_URL = 'https://punkmedallo.com';
export const TIENDA_URL = `${SITE_URL}/tienda`;
export const OG_LOGO_DEFAULT = `${SITE_URL}/logo_punk_medallo.jpg`;

/** URL absoluta del logo actual (config DB o default) — para OG/Twitter/JSON-LD/emails */
export async function ogImageActual(): Promise<string> {
  try {
    const cfg = await getTiendaConfig();
    return cfg.logoUrl ?? OG_LOGO_DEFAULT;
  } catch {
    return OG_LOGO_DEFAULT;
  }
}

interface BreadcrumbSegment {
  label: string;
  href?: string;
}

export function breadcrumbListJsonLd(segments: BreadcrumbSegment[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: segments.map((seg, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: seg.label,
      ...(seg.href && { item: `${SITE_URL}${seg.href}` }),
    })),
  };
}

export function productJsonLd(
  product: {
    nombre: string;
    descripcion: string;
    slug: string;
    precio: number;
    descuento?: number;
    stock: number;
    imagenes: { url: string }[];
    categoria: { nombre: string } | null;
    genero: string;
  },
  opts?: { shippingMin?: number; shippingMax?: number },
) {
  const minShip = opts?.shippingMin ?? 10000
  const maxShip = opts?.shippingMax ?? 20000
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${TIENDA_URL}/${product.slug}`,
    url: `${TIENDA_URL}/${product.slug}`,
    name: product.nombre,
    description: product.descripcion,
    image: product.imagenes.map((i) => i.url),
    brand: {
      '@type': 'Brand',
      name: 'Punk Medallo',
    },
    offers: {
      '@type': 'Offer',
      price: precioConDescuento(product.precio, product.descuento),
      priceCurrency: 'COP',
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${TIENDA_URL}/${product.slug}`,
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'CO',
        },
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: minShip,
          currency: 'COP',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 2,
            maxValue: maxShip === minShip ? 5 : 8,
            unitCode: 'DAY',
          },
        },
      },
    },
    merchantReturnPolicy: {
      '@type': 'MerchantReturnPolicy',
      returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
      merchantReturnLink: `${SITE_URL}/politica-de-cambios`,
    },
  };
}

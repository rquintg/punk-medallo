import type { Metadata } from 'next';
import CheckoutContent from './checkout-content';
import { ogImageActual } from '@/features/tienda/utils/seo';

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await ogImageActual();
  return {
    title: 'Checkout',
    description:
      'Finaliza tu compra en la tienda Punk Medallo.',
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: '/tienda/checkout',
    },
    openGraph: {
      title: 'Checkout - Punk Medallo',
      description:
        'Finaliza tu compra en la tienda Punk Medallo.',
      url: '/tienda/checkout',
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
      title: 'Checkout - Punk Medallo',
      description:
        'Finaliza tu compra en la tienda Punk Medallo.',
      images: [ogImage],
    },
  };
}

export default function CheckoutPage() {
  return <CheckoutContent />;
}

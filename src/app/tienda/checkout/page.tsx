import type { Metadata } from 'next';
import CheckoutContent from './checkout-content';

export const metadata: Metadata = {
  title: 'Checkout - Punk Medallo',
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
        url: 'https://punkmedallo.com/logo_punk_medallo.jpg',
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
    images: ['https://punkmedallo.com/logo_punk_medallo.jpg'],
  },
};

export default function CheckoutPage() {
  return <CheckoutContent />;
}

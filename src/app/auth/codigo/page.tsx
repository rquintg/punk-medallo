import type { Metadata } from 'next'
import CodigoForm from './codigo-form'

export const metadata: Metadata = {
  title: 'Confirma tu cuenta',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: '/auth/codigo',
  },
}

export default function CodigoPage() {
  return <CodigoForm />
}
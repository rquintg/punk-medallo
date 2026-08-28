'use client'

import { useState } from 'react'
import { ProductGallery } from '@/components/tienda/product-gallery'
import type { ProductImage } from '@/features/tienda/types'

export default function BoletasGalleryClient({ imagenes, nombre }: { imagenes: ProductImage[]; nombre: string }) {
  const [index, setIndex] = useState(0)
  return <ProductGallery imagenes={imagenes} nombre={nombre} imageIndex={index} onImageChange={setIndex} aspect="portrait" />
}

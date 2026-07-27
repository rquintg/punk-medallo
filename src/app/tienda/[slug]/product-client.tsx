'use client'

import { useState } from 'react'
import { ProductGallery } from '@/components/tienda/product-gallery'
import { ProductInfo } from '@/components/tienda/product-info'
import type { Producto } from '@/features/tienda/types'

export default function ProductClient({ producto }: { producto: Producto }) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [imageIndex, setImageIndex] = useState(0)

  function handleColorChange(color: string | null) {
    setSelectedColor(color)
    setImageIndex(0)
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
      <div className="w-full lg:w-3/5">
        <ProductGallery
          imagenes={producto.imagenes}
          nombre={producto.nombre}
          selectedColor={selectedColor}
          imageIndex={imageIndex}
          onImageChange={setImageIndex}
        />
      </div>
      <div className="w-full lg:w-2/5">
        <ProductInfo
          producto={producto}
          selectedColor={selectedColor}
          onColorChange={handleColorChange}
        />
      </div>
    </div>
  )
}

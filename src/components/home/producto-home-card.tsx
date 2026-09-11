'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Price from '@/components/tienda/price'
import type { Producto } from '@/features/tienda/types'
import { precioConDescuento } from '@/lib/precio'

interface ProductoHomeCardProps {
  producto: Producto
  index?: number
}

export default function ProductoHomeCard({ producto, index = 0 }: ProductoHomeCardProps) {
  const efectivo = precioConDescuento(producto.precio, producto.descuento)
  const tieneDescuento = producto.descuento > 0
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}>
      <Link href={`/tienda/${producto.slug}`} className="group block overflow-hidden rounded-xl border border-neutral-800 bg-surface hover:border-primary/50">
        <div className="relative aspect-square overflow-hidden bg-neutral-900">
          {producto.imagenes[0] ? (
            <Image src={producto.imagenes[0].url} alt={producto.nombre} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(min-width:1024px) 280px, (min-width:640px) 50vw, 100vw" priority={index < 2} />
          ) : null}
          {tieneDescuento && <span className="absolute left-2 top-2 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-black text-white">-{producto.descuento}%</span>}
        </div>
        <div className="p-3">
          <p className="truncate text-sm font-bold text-white group-hover:text-primary">{producto.nombre}</p>
          <p className="flex items-center gap-2 text-sm font-black text-primary">
            <Price amount={efectivo} />
            {tieneDescuento && <span className="text-xs font-normal text-muted-foreground line-through"><Price amount={producto.precio} /></span>}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}

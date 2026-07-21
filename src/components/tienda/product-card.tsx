'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, X, Check } from 'lucide-react';
import { useCart } from '@/features/tienda/store/use-cart';
import Price from './price';
import type { Producto, Talla } from '@/features/tienda/types';

interface ProductCardProps {
  product: Producto;
}

const TALLA_LABELS: Record<Talla, string> = {
  S: 'S',
  M: 'M',
  L: 'L',
  XL: 'XL',
};

const COLOR_SWATCHES: Record<string, string> = {
  Negro: '#1a1a1a',
  Blanco: '#f0f0f0',
  Rojo: '#dc2626',
  'Azul marino': '#1e3a5f',
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [showPopover, setShowPopover] = useState(false);
  const [selectedSize, setSelectedSize] = useState<Talla | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock < 5;
  const primaryImage = product.imagenes[0];
  const needsCustomization = product.tallasDisponibles.length > 0 || product.coloresDisponibles.length > 0;

  useEffect(() => {
    if (!showPopover) return;

    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowPopover(false);
        setSelectedSize(null);
        setSelectedColor(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPopover]);

  function canAdd(): boolean {
    if (product.tallasDisponibles.length > 0 && !selectedSize) return false;
    if (product.coloresDisponibles.length > 0 && !selectedColor) return false;
    return true;
  }

  function resetPopover() {
    setShowPopover(false);
    setSelectedSize(null);
    setSelectedColor(null);
  }

  function handleQuickAdd() {
    if (needsCustomization) {
      setShowPopover(true);
    } else {
      addItem(product, null, null, 1);
    }
  }

  function handleAddWithOptions() {
    if (!canAdd()) return;
    addItem(product, selectedSize, selectedColor, 1);
    resetPopover();
  }

  return (
    <div className="group relative flex flex-col rounded-lg border border-neutral-800 bg-[#111] transition-all duration-300 hover:border-[#a40202]/50">
      <Link
        href={`/tienda/${product.slug}`}
        className="relative aspect-square overflow-hidden rounded-t-lg"
        prefetch={true}
      >
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-300 ease-in-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-neutral-900 text-neutral-600">
            Sin imagen
          </div>
        )}

        {product.categoria === 'accesorios' && (
          <span className="absolute left-2 top-2 rounded-full bg-[#a40202] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm">
            Accesorio
          </span>
        )}

        {isLowStock && (
          <span className="absolute right-2 top-2 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-semibold text-black shadow-sm">
            ¡Últimas {product.stock}!
          </span>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <span className="text-lg font-bold tracking-wide text-white">
              Agotado
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/tienda/${product.slug}`}>
          <h3 className="font-bold leading-tight text-white transition-colors hover:text-[#dc2626]">
            {product.nombre}
          </h3>
        </Link>

        <p className="text-xl font-bold text-[#dc2626]">
          <Price amount={product.precio} />
        </p>

        <p className="text-xs text-neutral-500">
          {product.genero === 'hombre' ? 'Hombre' : product.genero === 'mujer' ? 'Mujer' : 'Unisex'}
          {' · '}
          {product.categoria === 'camisetas' ? 'Camiseta' : 'Accesorio'}
        </p>

        {showPopover && needsCustomization ? (
          <div
            ref={popoverRef}
            className="mt-auto flex flex-col gap-3 rounded-md border border-neutral-700 bg-[#1a1a1a] p-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-400">
                {product.coloresDisponibles.length > 0 && product.tallasDisponibles.length > 0
                  ? 'Color y talla'
                  : product.coloresDisponibles.length > 0
                    ? 'Seleccionar color'
                    : 'Seleccionar talla'}
              </span>
              <button
                onClick={resetPopover}
                className="text-neutral-500 transition-colors hover:text-white"
                aria-label="Cerrar selector"
              >
                <X size={14} />
              </button>
            </div>

            {product.coloresDisponibles.length > 0 && (
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                  Color
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {product.coloresDisponibles.map((color) => {
                    const isSelected = selectedColor === color;
                    const swatch = COLOR_SWATCHES[color] ?? '#666';
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-red-600 bg-red-600/10 text-white'
                            : 'border-neutral-600 text-neutral-300 hover:border-neutral-400'
                        }`}
                        aria-label={`Color ${color}`}
                        aria-pressed={isSelected}
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-neutral-500"
                          style={{ backgroundColor: swatch }}
                        />
                        {color}
                        {isSelected && <Check size={10} className="text-red-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {product.tallasDisponibles.length > 0 && (
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                  Talla
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {product.tallasDisponibles.map((talla) => (
                    <button
                      key={talla}
                      onClick={() => setSelectedSize(talla)}
                      className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-all ${
                        selectedSize === talla
                          ? 'border-red-600 bg-red-600 text-white'
                          : 'border-neutral-600 text-neutral-300 hover:border-neutral-400'
                      }`}
                      aria-label={`Talla ${TALLA_LABELS[talla]}`}
                      aria-pressed={selectedSize === talla}
                    >
                      {TALLA_LABELS[talla]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleAddWithOptions}
              disabled={!canAdd()}
              className="w-full rounded-md bg-red-600 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Agregar
            </button>
          </div>
        ) : (
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className="mt-auto flex w-full items-center justify-center gap-2 rounded-md bg-[#dc2626] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#b91c1c] active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
            aria-label={
              isOutOfStock
                ? `${product.nombre} - Agotado`
                : `Agregar ${product.nombre} al carrito`
            }
          >
            <ShoppingCart size={16} aria-hidden="true" />
            {isOutOfStock
              ? 'Agotado'
              : needsCustomization
                ? 'Seleccionar'
                : 'Agregar'}
          </button>
        )}
      </div>
    </div>
  );
}

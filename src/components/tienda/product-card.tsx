'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, X, Check } from 'lucide-react';
import { useCart } from '@/features/tienda/store/use-cart';
import Price from './price';
import { getColorHex } from '@/lib/color-swatch';
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

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [showPopover, setShowPopover] = useState(false);
  const [selectedSize, setSelectedSize] = useState<Talla | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const needsSize = product.tallasDisponibles.length > 0
  const needsColor = product.coloresDisponibles.length > 0
  const needsCustomization = needsSize || needsColor
  const hasVariants = !!product.variantes && product.variantes.length > 0

  const fullySelected = (!needsSize || selectedSize) && (!needsColor || selectedColor)

  const getVariantStock = useCallback(
    (talla: Talla | null, color: string | null): number => {
      if (!hasVariants) return product.stock
      const v = product.variantes!.find(
        (v) => v.talla === talla && v.color === color,
      )
      return v?.stock ?? 0
    },
    [hasVariants, product.variantes, product.stock],
  )

  const isColorAvailable = useCallback(
    (color: string): boolean => {
      if (!hasVariants) return true
      if (selectedSize) return getVariantStock(selectedSize, color) > 0
      return product.variantes!.some((v) => v.color === color && v.stock > 0)
    },
    [hasVariants, selectedSize, getVariantStock, product.variantes],
  )

  const isTallaAvailable = useCallback(
    (talla: Talla): boolean => {
      if (!hasVariants) return true
      if (selectedColor) return getVariantStock(talla, selectedColor) > 0
      return product.variantes!.some((v) => v.talla === talla && v.stock > 0)
    },
    [hasVariants, selectedColor, getVariantStock, product.variantes],
  )

  const variantStock = fullySelected && hasVariants
    ? getVariantStock(selectedSize, selectedColor)
    : null
  const variantAgotado = variantStock !== null && variantStock === 0
  const totalStock = hasVariants
    ? product.variantes!.reduce((s, v) => s + v.stock, 0)
    : product.stock
  const isOutOfStock = totalStock === 0
  const isLowStock = totalStock > 0 && totalStock < 5

  const primaryImage = product.imagenes[0];

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
    if (needsSize && !selectedSize) return false;
    if (needsColor && !selectedColor) return false;
    if (variantAgotado) return false;
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

  function handleColorClick(color: string) {
    setSelectedColor(color)
    if (selectedSize && getVariantStock(selectedSize, color) === 0) {
      setSelectedSize(null)
    }
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

        {product.categoria?.slug === 'accesorios' && (
          <span className="absolute left-2 top-2 rounded-full bg-[#a40202] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm">
            Accesorio
          </span>
        )}

        {isLowStock && (
          <span className="absolute right-2 top-2 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-semibold text-black shadow-sm">
            ¡Últimas {totalStock}!
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
          {product.categoria?.slug === 'camisetas' ? 'Camiseta' : 'Accesorio'}
        </p>

        {showPopover && needsCustomization ? (
          <div
            ref={popoverRef}
            className="mt-auto flex flex-col gap-3 rounded-md border border-neutral-700 bg-[#1a1a1a] p-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-400">
                {needsColor && needsSize
                  ? 'Color y talla'
                  : needsColor
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

            {needsColor && (
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                  Color
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {product.coloresDisponibles.map((color) => {
                    const isSelected = selectedColor === color;
                    const available = isColorAvailable(color);
                    const swatch = getColorHex(color);
                    return (
                      <button
                        key={color}
                        onClick={() => handleColorClick(color)}
                        disabled={!available}
                        className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-red-600 bg-red-600/10 text-white'
                            : available
                              ? 'border-neutral-600 text-neutral-300 hover:border-neutral-400'
                              : 'border-neutral-800 text-neutral-600 cursor-not-allowed line-through'
                        }`}
                        aria-label={`Color ${color}${!available ? ' — Agotado' : ''}`}
                        aria-pressed={isSelected}
                      >
                        <span
                          className={`h-3.5 w-3.5 rounded-full border ${
                            available ? 'border-neutral-500' : 'border-neutral-700'
                          }`}
                          style={{ backgroundColor: swatch }}
                        />
                        {color}
                        {!available && <span className="text-[10px] text-neutral-600">Agotado</span>}
                        {isSelected && <Check size={10} className="text-red-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {needsSize && (
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                  Talla
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {product.tallasDisponibles.map((talla) => {
                    const isSelected = selectedSize === talla;
                    const available = isTallaAvailable(talla);
                    return (
                      <button
                        key={talla}
                        onClick={() => { if (available) setSelectedSize(talla) }}
                        disabled={!available}
                        className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-all ${
                          isSelected
                            ? 'border-red-600 bg-red-600 text-white'
                            : available
                              ? 'border-neutral-600 text-neutral-300 hover:border-neutral-400'
                              : 'border-neutral-800 text-neutral-600 cursor-not-allowed line-through'
                        }`}
                        aria-label={`Talla ${TALLA_LABELS[talla]}${!available ? ' — Agotado' : ''}`}
                        aria-pressed={isSelected}
                      >
                        {TALLA_LABELS[talla]}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={handleAddWithOptions}
              disabled={!canAdd()}
              className="w-full rounded-md bg-red-600 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {variantAgotado ? 'Agotado' : 'Agregar'}
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

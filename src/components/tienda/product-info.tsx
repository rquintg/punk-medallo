'use client';

import { useState, useCallback } from 'react';
import { ShoppingBag, Check, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { getColorHex } from '@/lib/color-swatch';
import type { Producto, Talla } from '@/features/tienda/types';
import { useCart } from '@/features/tienda/store/use-cart';
import Price from '@/components/tienda/price';

interface ProductInfoProps {
  producto: Producto;
  selectedColor: string | null;
  onColorChange: (color: string | null) => void;
}

const TALLA_LABELS: Record<Talla, string> = {
  S: 'S',
  M: 'M',
  L: 'L',
  XL: 'XL',
};

export function ProductInfo({ producto, selectedColor, onColorChange }: ProductInfoProps) {
  const [selectedSize, setSelectedSize] = useState<Talla | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);

  const needsSize = producto.tallasDisponibles.length > 0;
  const needsColor = producto.coloresDisponibles.length > 0;

  const hasVariants = !!producto.variantes && producto.variantes.length > 0;

  const getVariantStock = useCallback(
    (talla: Talla | null, color: string | null): number => {
      if (!hasVariants) return producto.stock
      const v = producto.variantes!.find(
        (v) => v.talla === talla && v.color === color,
      )
      return v?.stock ?? 0
    },
    [hasVariants, producto.variantes, producto.stock],
  )

  const isColorAvailable = useCallback(
    (color: string): boolean => {
      if (!hasVariants) return true
      if (selectedSize) return getVariantStock(selectedSize, color) > 0
      return producto.variantes!.some((v) => v.color === color && v.stock > 0)
    },
    [hasVariants, selectedSize, getVariantStock, producto.variantes],
  )

  const isTallaAvailable = useCallback(
    (talla: Talla): boolean => {
      if (!hasVariants) return true
      if (selectedColor) return getVariantStock(talla, selectedColor) > 0
      return producto.variantes!.some((v) => v.talla === talla && v.stock > 0)
    },
    [hasVariants, selectedColor, getVariantStock, producto.variantes],
  )

  const fullySelected = (!needsSize || selectedSize) && (!needsColor || selectedColor)
  const variantStock = fullySelected && hasVariants
    ? getVariantStock(selectedSize, selectedColor)
    : null
  const maxQty = variantStock !== null ? variantStock : producto.stock
  const variantAgotado = variantStock !== null && variantStock === 0

  function handleAddToCart() {
    if (needsSize && !selectedSize) {
      toast.error('Selecciona una talla primero');
      return;
    }

    if (needsColor && !selectedColor) {
      toast.error('Selecciona un color primero');
      return;
    }

    if (variantAgotado) {
      toast.error('Esta combinación está agotada');
      return;
    }

    addItem(producto, selectedSize, selectedColor, quantity);

    setAdded(true);
    setQuantity(1);
    toast.success('Agregado al carrito');

    setTimeout(() => setAdded(false), 1500);
  }

  function handleColorClick(color: string) {
    onColorChange(color)
    if (selectedSize && getVariantStock(selectedSize, color) === 0) {
      setSelectedSize(null)
    }
  }

  const showStock = maxQty > 0

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white lg:text-3xl">
          {producto.nombre}
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          {producto.genero === 'hombre' ? 'Hombre' : producto.genero === 'mujer' ? 'Mujer' : 'Unisex'}
          {' / '}
          {producto.categoria?.nombre ?? 'Categoría'}
        </p>
      </div>

      <div className="text-3xl font-bold text-white">
        <Price amount={producto.precio} />
      </div>

      <div className="flex items-center gap-2">
        <div
          className={`h-2.5 w-2.5 rounded-full ${
            maxQty > 0 ? (maxQty < 5 ? 'bg-amber-500' : 'bg-green-500') : 'bg-red-500'
          }`}
        />
        <span className="text-sm text-white">
          {variantAgotado ? 'Agotado' : maxQty > 0 ? 'En stock' : producto.stock > 0 ? 'En stock' : 'Agotado'}
        </span>
        {maxQty > 0 && maxQty < 5 && (
          <span className="text-xs font-medium text-amber-500">
            — Solo quedan {maxQty}
          </span>
        )}
        {variantAgotado && (
          <span className="text-xs font-medium text-red-400">
            — Combinación agotada
          </span>
        )}
      </div>

      {needsColor && (
        <div>
          <p className="mb-3 text-sm font-bold text-neutral-300">Color</p>
          <div className="flex flex-wrap gap-2">
            {producto.coloresDisponibles.map((color) => {
              const isSelected = selectedColor === color;
              const available = isColorAvailable(color);
              const swatch = getColorHex(color);
              return (
                <button
                  key={color}
                  onClick={() => handleColorClick(color)}
                  disabled={!available}
                  className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-all ${
                    isSelected
                      ? 'border-red-600 bg-red-600/10 text-white'
                      : available
                        ? 'border-neutral-600 text-neutral-300 hover:border-neutral-500'
                        : 'border-neutral-800 text-neutral-600 cursor-not-allowed'
                  }`}
                  aria-label={`Color ${color}${!available ? ' — Agotado' : ''}`}
                  aria-pressed={isSelected}
                >
                  <span
                    className={`h-4 w-4 rounded-full border ${
                      available ? 'border-neutral-500' : 'border-neutral-700'
                    }`}
                    style={{ backgroundColor: swatch }}
                  />
                  {color}
                  {!available && <span className="text-[10px] text-neutral-600">Agotado</span>}
                  {isSelected && <Check size={12} className="text-red-500" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {needsSize && (
        <div>
          <p className="mb-3 text-sm font-bold text-neutral-300">Talla</p>
          <div className="flex flex-wrap gap-2">
            {producto.tallasDisponibles.map((talla) => {
              const isSelected = selectedSize === talla;
              const available = isTallaAvailable(talla);
              return (
                <button
                  key={talla}
                  onClick={() => { if (available) setSelectedSize(talla) }}
                  disabled={!available}
                  className={`flex h-10 w-10 items-center justify-center rounded-md border text-sm font-medium transition-all ${
                    isSelected
                      ? 'border-red-600 bg-red-600 text-white'
                      : available
                        ? 'border-neutral-600 text-neutral-300 hover:border-neutral-500'
                        : 'border-neutral-800 text-neutral-600 cursor-not-allowed'
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

      {showStock && !variantAgotado && (
        <div>
          <p className="mb-3 text-sm font-bold text-neutral-300">Cantidad</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-md border border-neutral-600 bg-neutral-900">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="flex h-10 w-10 items-center justify-center text-neutral-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Reducir cantidad"
              >
                <Minus size={16} />
              </button>
              <span className="flex h-10 w-12 items-center justify-center text-sm font-medium text-white select-none">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                disabled={quantity >= maxQty}
                className="flex h-10 w-10 items-center justify-center text-neutral-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Aumentar cantidad"
              >
                <Plus size={16} />
              </button>
            </div>
            <span className="text-xs text-neutral-300">
              <span className="text-white font-bold">{maxQty}
              </span> disponible{maxQty !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      <button
        onClick={handleAddToCart}
        disabled={maxQty === 0}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {added ? <Check size={18} /> : <ShoppingBag size={18} />}
        {added ? 'Agregado' : variantAgotado ? 'Agotado' : 'Agregar al carrito'}
      </button>

      <div className="border-t border-neutral-800 pt-6">
        <h2 className="mb-2 text-sm font-bold text-neutral-300">Descripción</h2>
        <p className="text-sm leading-relaxed text-neutral-400">
          {producto.descripcion}
        </p>
      </div>
    </div>
  );
}

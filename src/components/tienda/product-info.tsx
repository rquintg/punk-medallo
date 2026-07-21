'use client';

import { useState } from 'react';
import { ShoppingBag, Check, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Producto, Talla } from '@/features/tienda/types';
import { useCart } from '@/features/tienda/store/use-cart';
import Price from '@/components/tienda/price';

interface ProductInfoProps {
  producto: Producto;
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

export function ProductInfo({ producto }: ProductInfoProps) {
  const [selectedSize, setSelectedSize] = useState<Talla | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);

  const needsSize = producto.tallasDisponibles.length > 0;
  const needsColor = producto.coloresDisponibles.length > 0;

  function handleAddToCart() {
    if (needsSize && !selectedSize) {
      toast.error('Selecciona una talla primero');
      return;
    }

    if (needsColor && !selectedColor) {
      toast.error('Selecciona un color primero');
      return;
    }

    addItem(producto, selectedSize, selectedColor, quantity);

    setAdded(true);
    setQuantity(1);
    toast.success('Agregado al carrito');

    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white lg:text-3xl">
          {producto.nombre}
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          {producto.genero === 'hombre' ? 'Hombre' : producto.genero === 'mujer' ? 'Mujer' : 'Unisex'}
          {' / '}
          {producto.categoria === 'camisetas' ? 'Camisetas' : 'Accesorios'}
        </p>
      </div>

      <div className="text-3xl font-bold text-white">
        <Price amount={producto.precio} />
      </div>

      <div className="flex items-center gap-2">
        <div
          className={`h-2.5 w-2.5 rounded-full ${
            producto.stock > 0 ? (producto.stock < 5 ? 'bg-amber-500' : 'bg-green-500') : 'bg-red-500'
          }`}
        />
        <span className="text-sm text-neutral-400">
          {producto.stock > 0 ? 'En stock' : 'Agotado'}
        </span>
        {producto.stock > 0 && producto.stock < 5 && (
          <span className="text-xs font-medium text-amber-500">
            — Solo quedan {producto.stock}
          </span>
        )}
      </div>

      {needsColor && (
        <div>
          <p className="mb-3 text-sm font-medium text-neutral-300">Color</p>
          <div className="flex flex-wrap gap-2">
            {producto.coloresDisponibles.map((color) => {
              const isSelected = selectedColor === color;
              const swatch = COLOR_SWATCHES[color] ?? '#666';
              return (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-all ${
                    isSelected
                      ? 'border-red-600 bg-red-600/10 text-white'
                      : 'border-neutral-700 text-neutral-300 hover:border-neutral-500'
                  }`}
                  aria-label={`Color ${color}`}
                  aria-pressed={isSelected}
                >
                  <span
                    className="h-4 w-4 rounded-full border border-neutral-500"
                    style={{ backgroundColor: swatch }}
                  />
                  {color}
                  {isSelected && <Check size={12} className="text-red-500" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {needsSize && (
        <div>
          <p className="mb-3 text-sm font-medium text-neutral-300">Talla</p>
          <div className="flex flex-wrap gap-2">
            {producto.tallasDisponibles.map((talla) => {
              const isSelected = selectedSize === talla;
              return (
                <button
                  key={talla}
                  onClick={() => setSelectedSize(talla)}
                  className={`flex h-10 w-10 items-center justify-center rounded-md border text-sm font-medium transition-all ${
                    isSelected
                      ? 'border-red-600 bg-red-600 text-white'
                      : 'border-neutral-700 text-neutral-300 hover:border-neutral-500'
                  }`}
                  aria-label={`Talla ${TALLA_LABELS[talla]}`}
                  aria-pressed={isSelected}
                >
                  {TALLA_LABELS[talla]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {producto.stock > 0 && (
        <div>
          <p className="mb-3 text-sm font-medium text-neutral-300">Cantidad</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-md border border-neutral-700 bg-neutral-900">
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
                onClick={() => setQuantity(Math.min(producto.stock, quantity + 1))}
                disabled={quantity >= producto.stock}
                className="flex h-10 w-10 items-center justify-center text-neutral-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Aumentar cantidad"
              >
                <Plus size={16} />
              </button>
            </div>
            <span className="text-xs text-neutral-500">
              {producto.stock} disponible{producto.stock !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      <button
        onClick={handleAddToCart}
        disabled={producto.stock === 0}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {added ? <Check size={18} /> : <ShoppingBag size={18} />}
        {added ? 'Agregado' : 'Agregar al carrito'}
      </button>

      <div className="border-t border-neutral-800 pt-6">
        <h2 className="mb-2 text-sm font-medium text-neutral-300">Descripción</h2>
        <p className="text-sm leading-relaxed text-neutral-400">
          {producto.descripcion}
        </p>
      </div>
    </div>
  );
}

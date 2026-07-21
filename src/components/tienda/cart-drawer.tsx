'use client';

import { useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/features/tienda/store/use-cart';
import Price from './price';
import CartIcon from './cart-icon';
import type { CartItem, Talla } from '@/features/tienda/types';

export default function CartDrawer() {
  const { items, updateQuantity, removeItem, clearCart, totalItems, totalPrecio, drawerOpen, setDrawerOpen } =
    useCart();

  const open = useCallback(() => setDrawerOpen(true), [setDrawerOpen]);
  const close = useCallback(() => setDrawerOpen(false), [setDrawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [drawerOpen, close]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const count = totalItems();
  const total = totalPrecio();

  return (
    <>
      <CartIcon onClick={open} />

      <div
        className={`fixed inset-0 z-[9999] transition-all duration-300 ${
          drawerOpen ? '' : 'pointer-events-none'
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
            drawerOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={close}
          aria-hidden="true"
        />

        <div
          className={`absolute bottom-0 right-0 top-0 flex w-full max-w-md flex-col bg-[#111] shadow-xl transition-transform duration-300 ${
            drawerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Carrito de compras"
        >
          <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
            <h2 className="text-lg font-bold text-white">
              Mi Carrito {count > 0 && <span className="text-neutral-400 font-normal">({count})</span>}
            </h2>
            <div className="flex items-center gap-3">
              {count > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-neutral-500 underline underline-offset-2 transition-colors hover:text-neutral-300"
                  aria-label="Vaciar carrito"
                >
                  Vaciar carrito
                </button>
              )}
              <button
                type="button"
                onClick={close}
                className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
                aria-label="Cerrar carrito"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5">
              <ShoppingBag size={48} className="text-neutral-600" />
              <p className="text-center text-lg font-semibold text-neutral-400">
                Tu carrito está vacío
              </p>
              <button
                type="button"
                onClick={close}
                className="rounded-md bg-[#dc2626] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#b91c1c]"
              >
                Seguir comprando
              </button>
            </div>
          ) : (
            <>
              <ul className="flex-1 overflow-y-auto px-5 py-4">
                {items.map((item) => (
                  <CartItemRow
                    key={`${item.id}::${item.tallaSeleccionada ?? 'notalla'}`}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </ul>

              <div className="border-t border-neutral-800 px-5 py-4">
                <div className="mb-1 flex items-center justify-between text-sm text-neutral-400">
                  <span>Subtotal</span>
                  <span className="text-lg font-bold text-white">
                    <Price amount={total} />
                  </span>
                </div>
                <p className="mb-4 text-xs text-neutral-500">
                  Impuestos y envío calculados al finalizar la compra.
                </p>
                <Link
                  href="/tienda/checkout"
                  onClick={close}
                  className="flex w-full items-center justify-center rounded-md bg-[#dc2626] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#b91c1c]"
                >
                  Proceder al pago
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem;
  onUpdateQuantity: (productoId: string, talla: Talla | null, color: string | null, cantidad: number) => void;
  onRemove: (productoId: string, talla?: Talla | null, color?: string | null) => void;
}) {
  const image = item.imagenes[0];

  return (
    <li className="flex gap-3 border-b border-neutral-800 py-4 last:border-0">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-neutral-900">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-neutral-600">
            Sin img
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex justify-between gap-2">
          <Link
            href={`/tienda/${item.slug}`}
            className="text-sm font-semibold leading-tight text-white transition-colors hover:text-[#dc2626]"
          >
            {item.nombre}
          </Link>
          <button
            type="button"
            onClick={() => onRemove(item.id, item.tallaSeleccionada, item.colorSeleccionado)}
            className="shrink-0 text-neutral-500 transition-colors hover:text-[#dc2626]"
            aria-label={`Eliminar ${item.nombre} del carrito`}
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          {item.tallaSeleccionada && (
            <span className="text-xs text-neutral-500">
              Talla:{' '}
              <span className="font-medium text-neutral-400">{item.tallaSeleccionada}</span>
            </span>
          )}
          {item.colorSeleccionado && (
            <span className="text-xs text-neutral-500">
              Color:{' '}
              <span className="font-medium text-neutral-400">{item.colorSeleccionado}</span>
            </span>
          )}
        </div>

        <div className="mt-1 flex items-end justify-between">
          <div className="flex items-center rounded-md border border-neutral-700 bg-neutral-900">
            <button
              type="button"
              onClick={() =>
                onUpdateQuantity(
                  item.id,
                  item.tallaSeleccionada,
                  item.colorSeleccionado,
                  item.cantidad - 1,
                )
              }
              className="flex h-8 w-8 items-center justify-center text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
              aria-label="Disminuir cantidad"
            >
              <Minus size={14} />
            </button>
            <span className="flex h-8 w-9 items-center justify-center text-sm font-semibold text-white">
              {item.cantidad}
            </span>
            <button
              type="button"
              onClick={() =>
                onUpdateQuantity(
                  item.id,
                  item.tallaSeleccionada,
                  item.colorSeleccionado,
                  item.cantidad + 1,
                )
              }
              className="flex h-8 w-8 items-center justify-center text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
              aria-label="Aumentar cantidad"
            >
              <Plus size={14} />
            </button>
          </div>

          <span className="text-base font-bold text-[#dc2626]">
            <Price amount={item.precio * item.cantidad} />
          </span>
        </div>
      </div>
    </li>
  );
}

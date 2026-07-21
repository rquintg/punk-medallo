'use client';

import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/features/tienda/store/use-cart';

interface CartIconProps {
  onClick?: () => void;
}

export default function CartIcon({ onClick }: CartIconProps) {
  const { totalItems } = useCart();
  const count = totalItems();

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex items-center gap-2 rounded-md border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-white transition-colors hover:border-[#a40202] hover:text-[#dc2626]"
      aria-label={`Carrito con ${count} ${count === 1 ? 'artículo' : 'artículos'}`}
    >
      <ShoppingCart size={18} aria-hidden="true" />
      {count > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#dc2626] px-1.5 text-[11px] font-bold text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
      <span className="hidden sm:inline">Carrito</span>
    </button>
  );
}

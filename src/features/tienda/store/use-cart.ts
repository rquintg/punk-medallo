import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Producto, Talla, CartItem, Variante } from '../types';

const MAX_QUANTITY = 10

function findVariantId(
  producto: Producto,
  talla: Talla | null,
  color: string | null,
): string | null {
  if (!producto.variantes || producto.variantes.length === 0) return null

  const variant = producto.variantes.find((v: Variante) => {
    if (talla && v.talla !== talla) return false
    if (color && v.color !== color) return false
    return true
  })

  return variant?.id ?? null
}

function createCartItem(
  producto: Producto,
  variantId: string | null,
  tallaSeleccionada: Talla | null,
  colorSeleccionado: string | null,
  cantidad: number,
): CartItem {
  return { ...producto, variantId, tallaSeleccionada, colorSeleccionado, cantidad };
}

function itemKey(productoId: string, variantId: string | null, talla: Talla | null, color: string | null): string {
  if (variantId) return `${productoId}::variant::${variantId}`
  return `${productoId}::notalla::${talla ?? 'notalla'}::${color ?? 'nocolor'}`;
}

interface CartState {
  items: CartItem[];
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  addItem: (producto: Producto, tallaSeleccionada?: Talla | null, colorSeleccionado?: string | null, cantidad?: number) => void;
  removeItem: (productoId: string, tallaSeleccionada?: Talla | null, colorSeleccionado?: string | null) => void;
  updateQuantity: (productoId: string, tallaSeleccionada: Talla | null, colorSeleccionado: string | null, cantidad: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrecio: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      drawerOpen: false,

      setDrawerOpen: (open) => set({ drawerOpen: open }),

      addItem: (producto, tallaSeleccionada = null, colorSeleccionado = null, cantidad = 1) => {
        const qty = Math.min(Math.max(1, cantidad), MAX_QUANTITY);
        if (qty < 1) return;

        const variantId = findVariantId(producto, tallaSeleccionada, colorSeleccionado)

        set((state) => {
          const key = itemKey(producto.id, variantId, tallaSeleccionada, colorSeleccionado);
          const existingIndex = state.items.findIndex(
            (item) => itemKey(item.id, item.variantId, item.tallaSeleccionada, item.colorSeleccionado) === key,
          );

          if (existingIndex >= 0) {
            const updated = [...state.items];
            const current = updated[existingIndex];
            updated[existingIndex] = {
              ...current,
              cantidad: Math.min(current.cantidad + qty, MAX_QUANTITY),
            };
            return { items: updated, drawerOpen: true };
          }

          return {
            items: [...state.items, createCartItem(producto, variantId, tallaSeleccionada, colorSeleccionado, qty)],
            drawerOpen: true,
          };
        });
      },

      removeItem: (productoId, tallaSeleccionada = null, colorSeleccionado = null) => {
        set((state) => ({
          items: state.items.filter((item) => {
            return !(
              item.id === productoId &&
              item.tallaSeleccionada === tallaSeleccionada &&
              item.colorSeleccionado === colorSeleccionado
            )
          }),
        }));
      },

      updateQuantity: (productoId, tallaSeleccionada, colorSeleccionado, cantidad) => {
        if (cantidad < 1) {
          get().removeItem(productoId, tallaSeleccionada, colorSeleccionado);
          return;
        }
        const qty = Math.min(cantidad, MAX_QUANTITY);

        set((state) => ({
          items: state.items.map((item) =>
            item.id === productoId &&
            item.tallaSeleccionada === tallaSeleccionada &&
            item.colorSeleccionado === colorSeleccionado
              ? { ...item, cantidad: qty }
              : item,
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, item) => sum + item.cantidad, 0),

      totalPrecio: () =>
        get().items.reduce((sum, item) => sum + item.precio * item.cantidad, 0),
    }),
    {
      name: 'punk-medallo-cart',
      version: 2,
      partialize: (state) => ({ items: state.items }),
      migrate: (persisted) => {
        const state = persisted as { items?: unknown[] }
        if (!state.items || !Array.isArray(state.items)) {
          return { items: [] }
        }
        return { items: state.items.filter((i): i is CartItem => {
          if (!i || typeof i !== 'object') return false
          const item = i as Record<string, unknown>
          const valid =
            typeof item.id === 'string' &&
            typeof item.nombre === 'string' &&
            typeof item.precio === 'number' &&
            typeof item.cantidad === 'number'

          if (!valid) return false

          if (!('variantId' in item)) {
            (item as Record<string, unknown>).variantId = null
          }

          return true
        })}
      },
    },
  ),
);

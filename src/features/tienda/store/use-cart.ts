import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Producto, Talla } from '../types';
import type { CartItem } from '../types';

function createCartItem(
  producto: Producto,
  tallaSeleccionada: Talla | null,
  colorSeleccionado: string | null,
  cantidad: number,
): CartItem {
  return { ...producto, tallaSeleccionada, colorSeleccionado, cantidad };
}

function itemKey(productoId: string, talla: Talla | null, color: string | null): string {
  return `${productoId}::${talla ?? 'notalla'}::${color ?? 'nocolor'}`;
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
        if (cantidad < 1) return;

        set((state) => {
          const key = itemKey(producto.id, tallaSeleccionada, colorSeleccionado);
          const existingIndex = state.items.findIndex(
            (item) => itemKey(item.id, item.tallaSeleccionada, item.colorSeleccionado) === key,
          );

          if (existingIndex >= 0) {
            const updated = [...state.items];
            const current = updated[existingIndex];
            updated[existingIndex] = {
              ...current,
              cantidad: current.cantidad + cantidad,
            };
            return { items: updated, drawerOpen: true };
          }

          return {
            items: [...state.items, createCartItem(producto, tallaSeleccionada, colorSeleccionado, cantidad)],
            drawerOpen: true,
          };
        });
      },

      removeItem: (productoId, tallaSeleccionada = null, colorSeleccionado = null) => {
        const key = itemKey(productoId, tallaSeleccionada, colorSeleccionado);
        set((state) => ({
          items: state.items.filter(
            (item) => itemKey(item.id, item.tallaSeleccionada, item.colorSeleccionado) !== key,
          ),
        }));
      },

      updateQuantity: (productoId, tallaSeleccionada, colorSeleccionado, cantidad) => {
        if (cantidad < 1) {
          get().removeItem(productoId, tallaSeleccionada, colorSeleccionado);
          return;
        }

        const key = itemKey(productoId, tallaSeleccionada, colorSeleccionado);
        set((state) => ({
          items: state.items.map((item) =>
            itemKey(item.id, item.tallaSeleccionada, item.colorSeleccionado) === key
              ? { ...item, cantidad }
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
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, Package, CreditCard, MapPin, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/features/tienda/store/use-cart';
import { Breadcrumbs } from '@/components/tienda/breadcrumbs';
import Price from '@/components/tienda/price';
import type { CartItem } from '@/features/tienda/types';

interface OrderDetails {
  orderNumber: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  shipping: {
    nombre: string;
    email: string;
    telefono: string;
    direccion: string;
    ciudad: string;
  };
  estimatedDelivery: string;
}

function generateOrderNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'PM-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export default function CheckoutPage() {
  const { items, updateQuantity, removeItem, totalPrecio, totalItems, clearCart } = useCart();
  const [submitted, setSubmitted] = useState(false);
  const [order, setOrder] = useState<OrderDetails | null>(null);

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    if (!form.nombre || !form.email || !form.telefono || !form.direccion || !form.ciudad) {
      toast.error('Completa todos los campos del formulario');
      return;
    }

    const now = new Date();
    const orderDetails: OrderDetails = {
      orderNumber: generateOrderNumber(),
      date: formatDate(now),
      items: [...items],
      subtotal: totalPrecio(),
      shipping: { ...form },
      estimatedDelivery: formatDate(addDays(now, 5)),
    };

    setOrder(orderDetails);
    setSubmitted(true);
    toast.success('¡Pedido realizado con éxito!');
    clearCart();
  }

  if (submitted && order) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <Breadcrumbs
            segments={[
              { label: 'Tienda', href: '/tienda' },
              { label: 'Checkout' },
              { label: 'Pedido confirmado' },
            ]}
          />
        </div>

        <div className="rounded-lg border border-neutral-800 bg-[#111]">
          <div className="border-b border-neutral-800 px-6 py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-600">
              <Package size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">¡Pedido confirmado!</h1>
            <p className="mt-1 text-sm text-neutral-400">{order.orderNumber}</p>
          </div>

          <div className="space-y-5 px-6 py-6">
            <div className="flex items-center gap-3 text-sm text-neutral-400">
              <Calendar size={16} className="shrink-0 text-neutral-500" />
              <span>
                Pedido realizado el{' '}
                <span className="text-neutral-300">{order.date.split(',')[0]}</span>
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm text-neutral-400">
              <Package size={16} className="shrink-0 text-neutral-500" />
              <span>
                Llegada estimada:{' '}
                <span className="text-neutral-300">{order.estimatedDelivery}</span>
              </span>
            </div>

            <div className="flex items-start gap-3 text-sm text-neutral-400">
              <MapPin size={16} className="mt-0.5 shrink-0 text-neutral-500" />
              <span>
                Enviar a{' '}
                <span className="text-neutral-300">
                  {order.shipping.nombre}, {order.shipping.direccion}, {order.shipping.ciudad}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm text-neutral-400">
              <CreditCard size={16} className="shrink-0 text-neutral-500" />
              <span>
                Pagas con{' '}
                <span className="text-neutral-300">Pago contra entrega</span>
              </span>
            </div>
          </div>

          <div className="border-t border-neutral-800 px-6 py-6">
            <h3 className="mb-4 text-sm font-semibold text-white">
              Productos ({order.items.length})
            </h3>
            <ul className="divide-y divide-neutral-800">
              {order.items.map((item) => (
                <li key={`${item.id}-${item.tallaSeleccionada}-${item.colorSeleccionado}`} className="flex gap-3 py-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-neutral-800">
                    <Image
                      src={item.imagenes[0]?.url ?? ''}
                      alt={item.nombre}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-center">
                    <p className="text-sm font-medium text-white">{item.nombre}</p>
                    <div className="flex gap-3 text-xs text-neutral-500">
                      {item.tallaSeleccionada && <span>Talla: {item.tallaSeleccionada}</span>}
                      {item.colorSeleccionado && <span>Color: {item.colorSeleccionado}</span>}
                      <span>Cant: {item.cantidad}</span>
                    </div>
                  </div>
                  <span className="self-center text-sm font-medium text-white">
                    <Price amount={item.precio * item.cantidad} />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-neutral-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400">Total</span>
              <span className="text-lg font-bold text-[#dc2626]">
                <Price amount={order.subtotal} />
              </span>
            </div>
          </div>

          <div className="border-t border-neutral-800 px-6 py-5 text-center">
            <Link
              href="/tienda"
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              <ArrowLeft size={16} />
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Breadcrumbs
          segments={[
            { label: 'Tienda', href: '/tienda' },
            { label: 'Checkout' },
          ]}
        />
      </div>

      <h1 className="mb-8 text-3xl font-bold text-white md:text-4xl">Checkout</h1>

      <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
        <div className="w-full lg:w-3/5">
          <h2 className="mb-6 text-lg font-semibold text-white">Información de envío</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="nombre" className="mb-1.5 block text-sm text-neutral-300">
                  Nombre completo *
                </label>
                <input
                  id="nombre"
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition-colors focus:border-red-600"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm text-neutral-300">
                  Correo electrónico *
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition-colors focus:border-red-600"
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="telefono" className="mb-1.5 block text-sm text-neutral-300">
                  Teléfono *
                </label>
                <input
                  id="telefono"
                  type="tel"
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition-colors focus:border-red-600"
                  placeholder="300 123 4567"
                />
              </div>
              <div>
                <label htmlFor="ciudad" className="mb-1.5 block text-sm text-neutral-300">
                  Ciudad *
                </label>
                <input
                  id="ciudad"
                  type="text"
                  value={form.ciudad}
                  onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition-colors focus:border-red-600"
                  placeholder="Medellín"
                />
              </div>
            </div>

            <div>
              <label htmlFor="direccion" className="mb-1.5 block text-sm text-neutral-300">
                Dirección *
              </label>
              <input
                id="direccion"
                type="text"
                value={form.direccion}
                onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition-colors focus:border-red-600"
                placeholder="Cra 1 # 2-3"
              />
            </div>

            <button
              type="submit"
              disabled={items.length === 0}
              className="mt-4 w-full rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              Realizar pedido
            </button>
          </form>
        </div>

        <div className="w-full lg:w-2/5">
          <h2 className="mb-6 text-lg font-semibold text-white">
            Resumen del pedido ({totalItems()})
          </h2>

          <div className="rounded-lg border border-neutral-800 bg-neutral-900/50">
            {items.length === 0 ? (
              <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
                <ShoppingBag size={32} className="text-neutral-600" />
                <p className="text-sm text-neutral-500">El carrito está vacío</p>
                <Link
                  href="/tienda"
                  className="text-sm text-red-500 underline underline-offset-2 hover:text-red-400"
                >
                  Ir a la tienda
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-neutral-800">
                {items.map((item) => (
                  <li
                    key={`${item.id}-${item.tallaSeleccionada ?? 'notalla'}-${item.colorSeleccionado ?? 'nocolor'}`}
                    className="flex gap-3 px-6 py-4"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-neutral-800">
                      <Image
                        src={item.imagenes[0]?.url ?? ''}
                        alt={item.nombre}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5">
                      <Link
                        href={`/tienda/${item.slug}`}
                        className="text-sm font-semibold text-white hover:underline"
                      >
                        {item.nombre}
                      </Link>
                      <div className="flex flex-wrap gap-x-3 text-xs text-neutral-500">
                        {item.tallaSeleccionada && (
                          <span>
                            Talla:{' '}
                            <span className="font-medium text-neutral-400">
                              {item.tallaSeleccionada}
                            </span>
                          </span>
                        )}
                        {item.colorSeleccionado && (
                          <span>
                            Color:{' '}
                            <span className="font-medium text-neutral-400">
                              {item.colorSeleccionado}
                            </span>
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-end justify-between">
                        <div className="flex items-center rounded-md border border-neutral-700 bg-neutral-900">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.tallaSeleccionada,
                                item.colorSeleccionado,
                                item.cantidad - 1,
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
                            aria-label="Reducir cantidad"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="flex h-8 w-9 items-center justify-center text-sm font-semibold text-white">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
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
                        <div className="flex items-center gap-3">
                          <span className="text-base font-bold text-[#dc2626]">
                            <Price amount={item.precio * item.cantidad} />
                          </span>
                          <button
                            onClick={() =>
                              removeItem(item.id, item.tallaSeleccionada, item.colorSeleccionado)
                            }
                            className="text-neutral-500 transition-colors hover:text-[#dc2626]"
                            aria-label="Eliminar producto"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {items.length > 0 && (
              <div className="border-t border-neutral-800 px-6 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">Subtotal</span>
                  <span className="text-sm font-medium text-white">
                    <Price amount={totalPrecio()} />
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-neutral-400">Envío</span>
                  <span className="text-sm text-neutral-500">Por calcular</span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-neutral-800 pt-4">
                  <span className="text-base font-semibold text-white">Total</span>
                  <span className="text-base font-bold text-white">
                    <Price amount={totalPrecio()} />
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

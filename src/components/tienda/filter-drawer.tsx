'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';

interface FilterDrawerProps {
  children: ReactNode;
}

export function FilterDrawer({ children }: FilterDrawerProps) {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();

  const activeCategoria = searchParams.get('categoria');
  const activeTalla = searchParams.get('talla');
  const activePrecio = searchParams.get('precio');

  const filterCount = [activeCategoria, activeTalla, activePrecio].filter(Boolean).length;

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, close]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 px-4 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-500 hover:text-white"
        aria-label="Abrir filtros"
        aria-expanded={open}
      >
        <SlidersHorizontal size={16} />
        Filtros
        {filterCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-bold text-white">
            {filterCount}
          </span>
        )}
      </button>

      <div
        className={`fixed inset-0 z-[9999] transition-all duration-300 ${
          open ? '' : 'pointer-events-none'
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={close}
          aria-hidden="true"
        />

        <div
          className={`absolute bottom-0 left-0 top-0 flex w-full max-w-sm flex-col bg-[#111] shadow-xl transition-transform duration-300 ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Filtros de productos"
        >
          <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
            <h2 className="text-lg font-bold text-white">Filtros</h2>
            <button
              type="button"
              onClick={close}
              className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
              aria-label="Cerrar filtros"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

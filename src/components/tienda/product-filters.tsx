'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { X } from 'lucide-react';
import type { Categoria, Talla, Genero } from '@/features/tienda/types';

const CATEGORIES: { label: string; value: Categoria | 'all' }[] = [
  { label: 'Todo', value: 'all' },
  { label: 'Camisetas', value: 'camisetas' },
  { label: 'Accesorios', value: 'accesorios' },
];

const SIZES: { label: string; value: Talla | 'all' }[] = [
  { label: 'Todas', value: 'all' },
  { label: 'S', value: 'S' },
  { label: 'M', value: 'M' },
  { label: 'L', value: 'L' },
  { label: 'XL', value: 'XL' },
];

const GENDER: { label: string; value: Genero | 'all' }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Hombre', value: 'hombre' },
  { label: 'Mujer', value: 'mujer' },
  { label: 'Unisex', value: 'unisex' },
];

const PRICE_RANGES: Record<string, { label: string; min: number; max: number }> = {
  barato: { label: 'Menos de $50K', min: 0, max: 50000 },
  medio: { label: '$50K - $80K', min: 50000, max: 80000 },
  caro: { label: 'Más de $80K', min: 80000, max: Infinity },
};

type ActiveFilter =
  | { type: 'categoria'; value: string }
  | { type: 'genero'; value: string }
  | { type: 'talla'; value: string }
  | { type: 'precio'; value: string };

const FILTER_LABELS: Record<string, Record<string, string>> = {
  categoria: { camisetas: 'Camisetas', accesorios: 'Accesorios' },
  genero: { hombre: 'Hombre', mujer: 'Mujer', unisex: 'Unisex' },
  talla: { S: 'S', M: 'M', L: 'L', XL: 'XL' },
  precio: { barato: 'Menos de $50K', medio: '$50K - $80K', caro: 'Más de $80K' },
};

interface ProductFiltersProps {
  orientation: 'sidebar' | 'drawer';
}

export function ProductFilters({ orientation }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategoria = searchParams.get('categoria') ?? 'all';
  const activeGenero = searchParams.get('genero') ?? 'all';
  const activeTalla = searchParams.get('talla') ?? 'all';
  const activePrecio = searchParams.get('precio') ?? 'all';

  const hasActiveFilters = activeCategoria !== 'all' || activeGenero !== 'all' || activeTalla !== 'all' || activePrecio !== 'all';

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === 'all' || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  function clearFilters() {
    router.replace(window.location.pathname, { scroll: false });
  }

  const activeFilters: ActiveFilter[] = [];
  if (activeCategoria !== 'all') activeFilters.push({ type: 'categoria', value: activeCategoria });
  if (activeGenero !== 'all') activeFilters.push({ type: 'genero', value: activeGenero });
  if (activeTalla !== 'all') activeFilters.push({ type: 'talla', value: activeTalla });
  if (activePrecio !== 'all') activeFilters.push({ type: 'precio', value: activePrecio });

  function removeFilter(filter: ActiveFilter) {
    switch (filter.type) {
      case 'categoria':
        updateFilter('categoria', 'all');
        break;
      case 'genero':
        updateFilter('genero', 'all');
        break;
      case 'talla':
        updateFilter('talla', 'all');
        break;
      case 'precio':
        updateFilter('precio', 'all');
        break;
    }
  }

  const sectionClass = orientation === 'sidebar' ? 'mb-6' : 'mb-5';
  const labelClass = 'mb-3 block text-xs font-semibold uppercase tracking-wider text-neutral-400';
  const btnBase = 'rounded-md border px-3 py-1.5 text-sm font-medium transition-all';
  const btnInactive = 'border-neutral-700 text-neutral-300 hover:border-neutral-500';
  const btnActive = 'border-red-600 bg-red-600 text-white';

  function FilterButton({
    isActive,
    onClick,
    label,
    fullWidth,
  }: {
    isActive: boolean;
    onClick: () => void;
    label: string;
    fullWidth?: boolean;
  }) {
    return (
      <button
        onClick={onClick}
        className={`${btnBase} ${isActive ? btnActive : btnInactive} ${
          orientation === 'sidebar' && fullWidth ? 'w-full text-left' : ''
        }`}
      >
        {label}
      </button>
    );
  }

  return (
    <div className={orientation === 'sidebar' ? 'space-y-1' : ''}>
      <div className={sectionClass}>
        <p className={labelClass}>Categoría</p>
        <div className={`flex ${orientation === 'sidebar' ? 'flex-col' : 'flex-wrap'} gap-1.5`}>
          {CATEGORIES.map((cat) => (
            <FilterButton
              key={cat.value}
              isActive={activeCategoria === cat.value}
              onClick={() => updateFilter('categoria', cat.value)}
              label={cat.label}
              fullWidth
            />
          ))}
        </div>
      </div>

      <div className={sectionClass}>
        <p className={labelClass}>Género</p>
        <div className={`flex ${orientation === 'sidebar' ? 'flex-col' : 'flex-wrap'} gap-1.5`}>
          {GENDER.map((gen) => (
            <FilterButton
              key={gen.value}
              isActive={activeGenero === gen.value}
              onClick={() => updateFilter('genero', gen.value)}
              label={gen.label}
              fullWidth
            />
          ))}
        </div>
      </div>

      <div className={sectionClass}>
        <p className={labelClass}>Talla</p>
        <div className={`flex ${orientation === 'sidebar' ? 'flex-col' : 'flex-wrap'} gap-1.5`}>
          {SIZES.map((size) => (
            <FilterButton
              key={size.value}
              isActive={activeTalla === size.value}
              onClick={() => updateFilter('talla', size.value)}
              label={size.label}
              fullWidth
            />
          ))}
        </div>
      </div>

      <div className={sectionClass}>
        <p className={labelClass}>Precio</p>
        <div className={`flex ${orientation === 'sidebar' ? 'flex-col' : 'flex-wrap'} gap-1.5`}>
          <FilterButton
            isActive={activePrecio === 'all'}
            onClick={() => updateFilter('precio', 'all')}
            label="Todos"
            fullWidth
          />
          {Object.entries(PRICE_RANGES).map(([key, range]) => (
            <FilterButton
              key={key}
              isActive={activePrecio === key}
              onClick={() => updateFilter('precio', key)}
              label={range.label}
              fullWidth
            />
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <div className={`${sectionClass} pt-2`}>
          <p className={labelClass}>Filtros activos</p>
          <div className="flex flex-wrap items-center gap-2">
            {activeFilters.map((filter) => (
              <span
                key={`${filter.type}-${filter.value}`}
                className="inline-flex items-center gap-1 rounded-full bg-neutral-800 px-3 py-1 text-xs text-neutral-300"
              >
                {FILTER_LABELS[filter.type]?.[filter.value] ?? filter.value}
                <button
                  onClick={() => removeFilter(filter)}
                  className="ml-0.5 text-neutral-500 hover:text-white"
                  aria-label={`Quitar filtro ${filter.type}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <button
            onClick={clearFilters}
            className="mt-3 text-xs text-neutral-500 underline underline-offset-2 transition-colors hover:text-neutral-300"
          >
            Limpiar todos
          </button>
        </div>
      )}
    </div>
  );
}

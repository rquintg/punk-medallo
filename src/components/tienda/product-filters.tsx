'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { X } from 'lucide-react';
import type { Talla, Genero, CategoriaInfo } from '@/features/tienda/types';

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
  | { type: 'categoria_id'; value: string }
  | { type: 'genero'; value: string }
  | { type: 'talla'; value: string }
  | { type: 'precio'; value: string };

interface ProductFiltersProps {
  orientation: 'sidebar' | 'drawer';
  categorias: CategoriaInfo[];
}

export function ProductFilters({ orientation, categorias }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategoria = searchParams.get('categoria_id') ?? '';
  const activeGenero = searchParams.get('genero') ?? '';
  const activeTalla = searchParams.get('talla') ?? '';
  const activePrecio = searchParams.get('precio') ?? '';

  const hasActiveFilters = !!activeCategoria || !!activeGenero || !!activeTalla || !!activePrecio;

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!value || value === 'all') {
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
  if (activeCategoria) activeFilters.push({ type: 'categoria_id', value: activeCategoria });
  if (activeGenero) activeFilters.push({ type: 'genero', value: activeGenero });
  if (activeTalla) activeFilters.push({ type: 'talla', value: activeTalla });
  if (activePrecio) activeFilters.push({ type: 'precio', value: activePrecio });

  const activeCategoriaLabel = categorias.find(c => c.id === activeCategoria)?.nombre ?? activeCategoria;

  const FILTER_LABELS: Record<string, Record<string, string>> = {
    genero: { hombre: 'Hombre', mujer: 'Mujer', unisex: 'Unisex' },
    talla: { S: 'S', M: 'M', L: 'L', XL: 'XL' },
    precio: { barato: 'Menos de $50K', medio: '$50K - $80K', caro: 'Más de $80K' },
  };

  function removeFilter(filter: ActiveFilter) {
    switch (filter.type) {
      case 'categoria_id':
        updateFilter('categoria_id', '');
        break;
      case 'genero':
        updateFilter('genero', '');
        break;
      case 'talla':
        updateFilter('talla', '');
        break;
      case 'precio':
        updateFilter('precio', '');
        break;
    }
  }

  function filterLabel(filter: ActiveFilter): string {
    if (filter.type === 'categoria_id') return activeCategoriaLabel;
    return FILTER_LABELS[filter.type]?.[filter.value] ?? filter.value;
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
          <FilterButton
            isActive={!activeCategoria}
            onClick={() => updateFilter('categoria_id', '')}
            label="Todo"
            fullWidth
          />
          {categorias.map((cat) => (
            <FilterButton
              key={cat.id}
              isActive={activeCategoria === cat.id}
              onClick={() => updateFilter('categoria_id', cat.id)}
              label={cat.nombre}
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
            isActive={!activePrecio}
            onClick={() => updateFilter('precio', '')}
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
                {filterLabel(filter)}
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

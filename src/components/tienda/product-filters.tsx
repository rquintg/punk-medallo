'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCallback } from 'react';
import { X } from 'lucide-react';
import type { Talla, Genero, CategoriaInfo } from '@/features/tienda/types';
import { PRICE_RANGES } from '@/features/tienda/utils/precios';

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

type ActiveFilter =
  | { type: 'categoria'; value: string; label: string }
  | { type: 'genero'; value: string }
  | { type: 'talla'; value: string }
  | { type: 'precio'; value: string };

interface ProductFiltersProps {
  orientation: 'sidebar' | 'drawer';
  categorias: CategoriaInfo[];
  activeCategoria?: string | null;
  onFilterApplied?: () => void;
}

function categoriaHref(
  slug: string | null,
  searchParams: URLSearchParams,
): string {
  const params = new URLSearchParams(searchParams.toString());
  params.delete('page');
  const qs = params.toString();
  const base = slug ? `/tienda/categoria/${slug}` : '/tienda';
  return qs ? `${base}?${qs}` : base;
}

function FilterButton({
  isActive,
  onClick,
  label,
  fullWidth,
  orientation,
}: {
  isActive: boolean;
  onClick: () => void;
  label: string;
  fullWidth?: boolean;
  orientation: 'sidebar' | 'drawer';
}) {
  const base = 'rounded-md border px-3 py-1.5 text-sm font-medium transition-all';
  const active = 'border-red-600 bg-red-600 text-white';
  const inactive = 'border-neutral-700 text-neutral-300 hover:border-neutral-500';

  return (
    <button
      onClick={onClick}
      className={`${base} ${isActive ? active : inactive} ${
        orientation === 'sidebar' && fullWidth ? 'w-full text-left' : ''
      }`}
    >
      {label}
    </button>
  );
}

export function ProductFilters({
  orientation,
  categorias,
  activeCategoria = null,
  onFilterApplied,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeGenero = searchParams.get('genero') ?? '';
  const activeTalla = searchParams.get('talla') ?? '';
  const activePrecio = searchParams.get('precio') ?? '';

  const hasActiveFilters =
    !!activeCategoria || !!activeGenero || !!activeTalla || !!activePrecio;

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('page');
      if (!value || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.replace(`?${params.toString()}`, { scroll: false });
      onFilterApplied?.();
    },
    [router, searchParams, onFilterApplied],
  );

  function clearFilters() {
    router.replace(window.location.pathname, { scroll: false });
    onFilterApplied?.();
  }

  const activeFilters: ActiveFilter[] = [];
  if (activeCategoria) {
    const label =
      categorias.find((c) => c.slug === activeCategoria)?.nombre ??
      activeCategoria;
    activeFilters.push({ type: 'categoria', value: activeCategoria, label });
  }
  if (activeGenero) activeFilters.push({ type: 'genero', value: activeGenero });
  if (activeTalla) activeFilters.push({ type: 'talla', value: activeTalla });
  if (activePrecio) activeFilters.push({ type: 'precio', value: activePrecio });

  const FILTER_LABELS: Record<string, Record<string, string>> = {
    genero: { hombre: 'Hombre', mujer: 'Mujer', unisex: 'Unisex' },
    talla: { S: 'S', M: 'M', L: 'L', XL: 'XL' },
    precio: Object.fromEntries(
      Object.values(PRICE_RANGES).map((r) => [r.key, r.label]),
    ),
  };

  function removeFilter(filter: ActiveFilter) {
    if (filter.type === 'categoria') {
      router.replace(categoriaHref(null, searchParams), { scroll: false });
    } else {
      updateFilter(filter.type, '');
    }
  }

  function filterLabel(filter: ActiveFilter): string {
    if (filter.type === 'categoria') return filter.label;
    return FILTER_LABELS[filter.type]?.[filter.value] ?? filter.value;
  }

  const sectionClass = orientation === 'sidebar' ? 'mb-6' : 'mb-5';
  const labelClass =
    'mb-3 block text-xs font-semibold uppercase tracking-wider text-neutral-400';

  return (
    <div className={orientation === 'sidebar' ? 'space-y-1' : ''}>
      <div className={sectionClass}>
        <p className={labelClass}>Categoría</p>
        <div
          className={`flex ${
            orientation === 'sidebar' ? 'flex-col' : 'flex-wrap'
          } gap-1.5`}
        >
          <Link
            href={categoriaHref(null, searchParams)}
            className={`${'rounded-md border px-3 py-1.5 text-sm font-medium transition-all'} ${
              !activeCategoria
                ? 'border-red-600 bg-red-600 text-white'
                : 'border-neutral-700 text-neutral-300 hover:border-neutral-500'
            } ${orientation === 'sidebar' ? 'w-full text-left' : ''}`}
          >
            Todo
          </Link>
          {categorias.map((cat) => (
            <Link
              key={cat.id}
              href={categoriaHref(cat.slug, searchParams)}
              className={`${'rounded-md border px-3 py-1.5 text-sm font-medium transition-all'} ${
                activeCategoria === cat.slug
                  ? 'border-red-600 bg-red-600 text-white'
                  : 'border-neutral-700 text-neutral-300 hover:border-neutral-500'
              } ${orientation === 'sidebar' ? 'w-full text-left' : ''}`}
            >
              {cat.nombre}
            </Link>
          ))}
        </div>
      </div>

      <div className={sectionClass}>
        <p className={labelClass}>Género</p>
        <div
          className={`flex ${
            orientation === 'sidebar' ? 'flex-col' : 'flex-wrap'
          } gap-1.5`}
        >
          {GENDER.map((gen) => (
            <FilterButton
              key={gen.value}
              orientation={orientation}
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
        <div
          className={`flex ${
            orientation === 'sidebar' ? 'flex-col' : 'flex-wrap'
          } gap-1.5`}
        >
          {SIZES.map((size) => (
            <FilterButton
              key={size.value}
              orientation={orientation}
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
        <div
          className={`flex ${
            orientation === 'sidebar' ? 'flex-col' : 'flex-wrap'
          } gap-1.5`}
        >
          <FilterButton
            orientation={orientation}
            isActive={!activePrecio}
            onClick={() => updateFilter('precio', '')}
            label="Todos"
            fullWidth
          />
          {Object.values(PRICE_RANGES).map((range) => (
            <FilterButton
              key={range.key}
              orientation={orientation}
              isActive={activePrecio === range.key}
              onClick={() => updateFilter('precio', range.key)}
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

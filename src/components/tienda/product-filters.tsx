'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Percent, X } from 'lucide-react';
import type { Talla, Genero, CategoriaInfo } from '@/features/tienda/types';
import type { PrecioLimites } from '@/features/tienda/services/products';
import { formatearPesos, parsePrecios } from '@/features/tienda/utils/precios';

const SIZES: { label: string; value: Talla }[] = [
  { label: 'S', value: 'S' },
  { label: 'M', value: 'M' },
  { label: 'L', value: 'L' },
  { label: 'XL', value: 'XL' },
];

const GENDER: { label: string; value: Genero }[] = [
  { label: 'Hombre', value: 'hombre' },
  { label: 'Mujer', value: 'mujer' },
  { label: 'Unisex', value: 'unisex' },
];

type ActiveFilter =
  | { type: 'categoria'; value: string; label: string }
  | { type: 'genero'; value: string }
  | { type: 'talla'; value: string }
  | { type: 'precio'; value: string; label: string }
  | { type: 'oferta'; value: string };

interface ProductFiltersProps {
  orientation: 'sidebar' | 'drawer';
  categorias: CategoriaInfo[];
  activeCategoria?: string | null;
  precioLimites: PrecioLimites;
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

function CheckFilter({
  checked,
  onChange,
  label,
  orientation,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  orientation: 'sidebar' | 'drawer';
}) {
  return (
    <label
      className={`flex cursor-pointer select-none items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-all ${
        checked
          ? 'border-red-600 bg-red-600/10 text-white'
          : 'border-neutral-700 text-neutral-300 hover:border-neutral-500'
      } ${orientation === 'sidebar' ? 'w-full' : ''}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 shrink-0 cursor-pointer rounded accent-red-600"
      />
      {label}
    </label>
  );
}

function pesosCorto(n: number): string {
  if (n < 1000) return String(n);
  return `${Math.round(n / 1000)}K`;
}

export function ProductFilters({
  orientation,
  categorias,
  activeCategoria = null,
  precioLimites,
  onFilterApplied,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const esPaginaOfertas = pathname === '/tienda/ofertas';

  const activeGeneros = (searchParams.get('genero') ?? '')
    .split(',')
    .filter(Boolean);
  const activeTallas = (searchParams.get('talla') ?? '').split(',').filter(Boolean);
  const activeOferta = esPaginaOfertas || searchParams.get('oferta') === '1';

  const rangoPrecio = parsePrecios({
    precio_min: searchParams.get('precio_min'),
    precio_max: searchParams.get('precio_max'),
  });

  const hasActiveFilters =
    !!activeCategoria ||
    activeGeneros.length > 0 ||
    activeTallas.length > 0 ||
    rangoPrecio.min !== undefined ||
    rangoPrecio.max !== undefined ||
    activeOferta;

  const toggleMulti = useCallback(
    (key: string, value: string) => {
      const current = (searchParams.get(key) ?? '').split(',').filter(Boolean);
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      const params = new URLSearchParams(searchParams.toString());
      params.delete('page');
      if (next.length === 0) {
        params.delete(key);
      } else {
        params.set(key, next.join(','));
      }
      router.replace(`?${params.toString()}`, { scroll: false });
      onFilterApplied?.();
    },
    [router, searchParams, onFilterApplied],
  );

  function clearFilters() {
    router.replace(esPaginaOfertas ? '/tienda' : window.location.pathname, { scroll: false });
    onFilterApplied?.();
  }

  const activeFilters: ActiveFilter[] = [];
  if (activeCategoria) {
    const label =
      categorias.find((c) => c.slug === activeCategoria)?.nombre ??
      activeCategoria;
    activeFilters.push({ type: 'categoria', value: activeCategoria, label });
  }
  for (const g of activeGeneros) {
    activeFilters.push({ type: 'genero', value: g });
  }
  for (const t of activeTallas) {
    activeFilters.push({ type: 'talla', value: t });
  }
  if (rangoPrecio.min !== undefined || rangoPrecio.max !== undefined) {
    const label =
      rangoPrecio.min !== undefined && rangoPrecio.max !== undefined
        ? `${formatearPesos(rangoPrecio.min)} – ${formatearPesos(rangoPrecio.max)}`
        : rangoPrecio.min !== undefined
          ? `Desde ${formatearPesos(rangoPrecio.min)}`
          : `Hasta ${formatearPesos(rangoPrecio.max as number)}`;
    activeFilters.push({ type: 'precio', value: 'precio', label });
  }
  if (activeOferta) activeFilters.push({ type: 'oferta', value: '1' });

  function removeFilter(filter: ActiveFilter) {
    if (filter.type === 'categoria') {
      router.replace(categoriaHref(null, searchParams), { scroll: false });
    } else if (filter.type === 'oferta') {
      if (esPaginaOfertas) {
        router.replace('/tienda', { scroll: false });
      } else {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('page');
        params.delete('oferta');
        router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
      }
    } else if (filter.type === 'precio') {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('page');
      params.delete('precio_min');
      params.delete('precio_max');
      router.replace(`?${params.toString()}`, { scroll: false });
    } else if (filter.type === 'genero' || filter.type === 'talla') {
      toggleMulti(filter.type, filter.value);
    }
    onFilterApplied?.();
  }

  function toggleOferta() {
    if (activeOferta) {
      if (esPaginaOfertas) {
        router.replace('/tienda', { scroll: false });
      } else {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('page');
        params.delete('oferta');
        router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
      }
    } else {
      router.replace('/tienda/ofertas', { scroll: false });
    }
    onFilterApplied?.();
  }

  function filterLabel(filter: ActiveFilter): string {
    if (filter.type === 'categoria') return filter.label;
    const FILTER_LABELS: Record<string, Record<string, string>> = {
      genero: { hombre: 'Hombre', mujer: 'Mujer', unisex: 'Unisex' },
      talla: { S: 'S', M: 'M', L: 'L', XL: 'XL' },
      oferta: { '1': 'Ofertas' },
    };
    return FILTER_LABELS[filter.type]?.[filter.value] ?? filter.value;
  }

  const limiteMin = precioLimites.min;
  const limiteMax = Math.max(precioLimites.max, limiteMin + 1);
  const [draftMin, setDraftMin] = useState<number | null>(rangoPrecio.min ?? limiteMin);
  const [draftMax, setDraftMax] = useState<number | null>(rangoPrecio.max ?? limiteMax);

  useEffect(() => {
    setDraftMin(rangoPrecio.min ?? limiteMin);
    setDraftMax(rangoPrecio.max ?? limiteMax);
  }, [rangoPrecio.min, rangoPrecio.max, limiteMin, limiteMax]);

  function aplicarPrecio(params: URLSearchParams, min: number | null, max: number | null) {
    if (min !== null) params.set('precio_min', String(min));
    if (max !== null) params.set('precio_max', String(max));
  }

  function aplicarSlider() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    aplicarPrecio(params, draftMin, draftMax);
    router.replace(`?${params.toString()}`, { scroll: false });
    onFilterApplied?.();
  }

  function aplicarInputs() {
    let min = draftMin !== null && Number.isFinite(draftMin) ? Math.round(draftMin) : null;
    let max = draftMax !== null && Number.isFinite(draftMax) ? Math.round(draftMax) : null;

    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');

    if (min === null && max === null) {
      params.delete('precio_min');
      params.delete('precio_max');
    } else {
      if (min !== null) min = Math.min(Math.max(min, limiteMin), limiteMax);
      if (max !== null) max = Math.min(Math.max(max, limiteMin), limiteMax);
      if (min !== null && max !== null && min > max) {
        const swap = min;
        min = max;
        max = swap;
      }
      aplicarPrecio(params, min, max);
    }

    router.replace(`?${params.toString()}`, { scroll: false });
    onFilterApplied?.();
  }

  const span = limiteMax - limiteMin || 1;
  const pctA = Math.min(Math.max((((draftMin ?? limiteMin) - limiteMin) / span) * 100, 0), 100);
  const pctB = Math.min(Math.max((((draftMax ?? limiteMax) - limiteMin) / span) * 100, 0), 100);
  const trackFill = `linear-gradient(to right, #262626 ${pctA}%, #dc2626 ${pctA}%, #dc2626 ${pctB}%, #262626 ${pctB}%)`;

  const rangeClassName = `pointer-events-none absolute h-4 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-red-600 [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-red-600`;
  const sliderProps = {
    type: 'range',
    min: limiteMin,
    max: limiteMax,
    step: Math.max(1000, Math.ceil((limiteMax - limiteMin) / 100)),
  } as const;

  const sectionClass = orientation === 'sidebar' ? 'mb-6' : 'mb-5';
  const labelClass =
    'mb-3 block text-xs font-semibold uppercase tracking-wider text-neutral-400';

  return (
    <div className={orientation === 'sidebar' ? 'space-y-1' : ''}>
      {hasActiveFilters && (
        <div className={`${sectionClass} pt-2`}>
          <p className={labelClass}>Filtros activos</p>
          <div className="flex flex-wrap items-center gap-2">
            {activeFilters.map((filter) => (
              <span
                key={`${filter.type}-${filter.value}`}
                className="inline-flex items-center gap-1 rounded-full bg-neutral-800 px-3 py-1 text-xs text-neutral-300"
              >
                {filter.type === 'precio' ? filter.label : filterLabel(filter)}
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

      <div className={sectionClass}>
        <p className={labelClass}>Precio</p>
        <div className="relative h-4">
          <div
            className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full"
            style={{ background: trackFill }}
          />
          <input
            {...sliderProps}
            value={draftMin ?? limiteMin}
            onChange={(e) => setDraftMin(Number(e.target.value))}
            onPointerUp={aplicarSlider}
            onTouchEnd={aplicarSlider}
            onKeyUp={(e) => {
              if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') aplicarSlider();
            }}
            className={rangeClassName}
            aria-label="Precio mínimo"
          />
          <input
            {...sliderProps}
            value={draftMax ?? limiteMax}
            onChange={(e) => setDraftMax(Number(e.target.value))}
            onPointerUp={aplicarSlider}
            onTouchEnd={aplicarSlider}
            onKeyUp={(e) => {
              if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') aplicarSlider();
            }}
            className={rangeClassName}
            aria-label="Precio máximo"
          />
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-neutral-500">
          <span>{pesosCorto(limiteMin)}</span>
          <span>{pesosCorto(Math.round((limiteMin + limiteMax) / 2))}</span>
          <span>{pesosCorto(limiteMax)}</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
              $
            </span>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              placeholder={String(limiteMin)}
              value={draftMin ?? ''}
              onChange={(e) =>
                setDraftMin(e.target.value === '' ? null : Number(e.target.value))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') aplicarInputs();
              }}
              onBlur={aplicarInputs}
              className="w-full rounded-md border border-neutral-700 bg-transparent py-1.5 pl-6 pr-2 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-red-600"
              aria-label="Precio inicial"
            />
          </div>
          <span className="text-neutral-500">–</span>
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
              $
            </span>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              placeholder={String(limiteMax)}
              value={draftMax ?? ''}
              onChange={(e) =>
                setDraftMax(e.target.value === '' ? null : Number(e.target.value))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') aplicarInputs();
              }}
              onBlur={aplicarInputs}
              className="w-full rounded-md border border-neutral-700 bg-transparent py-1.5 pl-6 pr-2 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-red-600"
              aria-label="Precio final"
            />
          </div>
        </div>
      </div>

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
        <p className={labelClass}>Ofertas</p>
        <button
          type="button"
          onClick={toggleOferta}
          className={`flex w-full items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-all ${
            activeOferta
              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
              : 'border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:text-white'
          }`}
        >
          <Percent size={14} className={activeOferta ? 'text-emerald-400' : 'text-neutral-500'} />
          Solo ofertas
        </button>
      </div>

      <div className={sectionClass}>
        <p className={labelClass}>Género</p>
        <div
          className={`flex ${
            orientation === 'sidebar' ? 'flex-col' : 'flex-wrap'
          } gap-1.5`}
        >
          {GENDER.map((gen) => (
            <CheckFilter
              key={gen.value}
              orientation={orientation}
              checked={activeGeneros.includes(gen.value)}
              onChange={() => toggleMulti('genero', gen.value)}
              label={gen.label}
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
            <CheckFilter
              key={size.value}
              orientation={orientation}
              checked={activeTallas.includes(size.value)}
              onChange={() => toggleMulti('talla', size.value)}
              label={size.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
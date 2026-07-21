'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const SORT_OPTIONS = [
  { value: 'relevancia', label: 'Relevancia' },
  { value: 'precio-asc', label: 'Precio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio: mayor a menor' },
  { value: 'nombre-asc', label: 'Nombre: A-Z' },
  { value: 'nombre-desc', label: 'Nombre: Z-A' },
] as const;

export function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSort = searchParams.get('sort') ?? 'relevancia';

  const updateSort = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === 'relevancia' || value === '') {
        params.delete('sort');
      } else {
        params.set('sort', value);
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <select
      value={activeSort}
      onChange={(e) => updateSort(e.target.value)}
      className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-300 outline-none transition-colors focus:border-red-600"
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

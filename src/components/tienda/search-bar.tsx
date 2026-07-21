'use client';

import Form from 'next/form';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

interface SearchBarProps {
  className?: string;
}

export function SearchBar({ className }: SearchBarProps) {
  const searchParams = useSearchParams();

  return (
    <Form action="/tienda/buscar" className={className}>
      <div className="relative">
        <input
          key={searchParams?.get('q') ?? 'empty'}
          type="text"
          name="q"
          placeholder="Buscar productos..."
          autoComplete="off"
          defaultValue={searchParams?.get('q') ?? ''}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-500 outline-none transition-colors focus:border-red-600"
        />
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
      </div>
    </Form>
  );
}

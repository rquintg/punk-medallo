'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
}

function getPageItems(page: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: (number | 'ellipsis')[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) items.push('ellipsis');
  for (let i = start; i <= end; i++) items.push(i);
  if (end < totalPages - 1) items.push('ellipsis');
  items.push(totalPages);

  return items;
}

export function Pagination({ page, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function goTo(target: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(target));
    router.replace(`?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (totalPages <= 1) return null;

  const btnBase =
    'flex h-9 min-w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <nav aria-label="Paginación" className="mt-10 flex items-center justify-center gap-1.5">
      <button
        type="button"
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
        className={`${btnBase} border-neutral-700 text-neutral-300 hover:border-neutral-500`}
      >
        <ChevronLeft size={16} />
      </button>

      {getPageItems(page, totalPages).map((item, index) =>
        item === 'ellipsis' ? (
          <span
            key={`ellipsis-${index}`}
            className="flex h-9 w-6 items-center justify-center text-sm text-neutral-600"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => goTo(item)}
            aria-current={item === page ? 'page' : undefined}
            className={`${btnBase} ${
              item === page
                ? 'border-red-600 bg-red-600 text-white'
                : 'border-neutral-700 text-neutral-300 hover:border-neutral-500'
            }`}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        aria-label="Página siguiente"
        className={`${btnBase} border-neutral-700 text-neutral-300 hover:border-neutral-500`}
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

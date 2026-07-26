import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbSegment {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  segments: BreadcrumbSegment[];
}

export function Breadcrumbs({ segments }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-500">
      {segments.map((segment, i) => {
        const isLast = i === segments.length - 1;
        return (
          <span key={segment.label} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={12} aria-hidden="true" />}
            {segment.href && !isLast ? (
              <Link
                href={segment.href}
                className="transition-colors hover:text-neutral-300"
              >
                {segment.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-neutral-300' : ''}>
                {segment.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

import type { ReactNode } from 'react';

export default function TiendaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-20 pb-8">
      {children}
    </div>
  );
}

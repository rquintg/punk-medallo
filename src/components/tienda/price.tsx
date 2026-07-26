import type { ReactElement } from 'react';

interface PriceProps {
  amount: number;
  className?: string;
}

const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export default function Price({ amount, className }: PriceProps): ReactElement {
  return (
    <span className={className} suppressHydrationWarning>
      {currencyFormatter.format(amount)}
    </span>
  );
}

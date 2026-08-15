'use client';

import type { CategoriaInfo } from '@/features/tienda/types';
import type { PrecioLimites } from '@/features/tienda/services/products';
import { FilterDrawer } from './filter-drawer';
import { ProductFilters } from './product-filters';

interface MobileFiltersProps {
  categorias: CategoriaInfo[];
  activeCategoria?: string | null;
  precioLimites: PrecioLimites;
}

export function MobileFilters({ categorias, activeCategoria = null, precioLimites }: MobileFiltersProps) {
  return (
    <FilterDrawer categoria={activeCategoria}>
      {(close) => (
        <ProductFilters
          orientation="drawer"
          categorias={categorias}
          activeCategoria={activeCategoria}
          precioLimites={precioLimites}
          onFilterApplied={close}
        />
      )}
    </FilterDrawer>
  );
}
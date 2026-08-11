'use client';

import type { CategoriaInfo } from '@/features/tienda/types';
import { FilterDrawer } from './filter-drawer';
import { ProductFilters } from './product-filters';

interface MobileFiltersProps {
  categorias: CategoriaInfo[];
  activeCategoria?: string | null;
}

export function MobileFilters({ categorias, activeCategoria = null }: MobileFiltersProps) {
  return (
    <FilterDrawer categoria={activeCategoria}>
      {(close) => (
        <ProductFilters
          orientation="drawer"
          categorias={categorias}
          activeCategoria={activeCategoria}
          onFilterApplied={close}
        />
      )}
    </FilterDrawer>
  );
}
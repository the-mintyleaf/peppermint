'use client';

import { useTableStore } from '../../../wrappers/DataTableWrapper';

export function useHasActiveFilters() {
  const useTable = useTableStore();
  const filters = useTable((s) => s.filters);
  const search = useTable((s) => s.search);
  const hasSearch = search.trim().length > 0;
  const hasFilters = Object.keys(filters).length > 0 || hasSearch;
  return hasFilters;
}

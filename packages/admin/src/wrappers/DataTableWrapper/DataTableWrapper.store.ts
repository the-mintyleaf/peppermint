import { createStore } from 'zustand';
import type { DataTableStoreState } from './DataTableWrapper.types';

// Instance-scoped — createStore (not create) so no global singleton leak
export function createDataTableStore(defaultPageSize = 20) {
  return createStore<DataTableStoreState>((set) => ({
    page: 1,
    pageSize: defaultPageSize,
    search: '',
    filters: [],
    sort: null,
    selectedIds: [],
    columnVisibility: {},
    density: 'normal',

    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    // Reset to page 1 on new search — stale page would show empty results
    setSearch: (search) => set({ search, page: 1 }),
    setFilters: (filters) => set({ filters, page: 1 }),
    setSort: (sort) => set({ sort, page: 1 }),

    toggleRow: (id) =>
      set((s) => ({
        selectedIds: s.selectedIds.includes(id)
          ? s.selectedIds.filter((x) => x !== id)
          : [...s.selectedIds, id],
      })),

    selectAll: (ids) => set({ selectedIds: ids }),
    clearSelection: () => set({ selectedIds: [] }),

    setColumnVisibility: (columnVisibility) => set({ columnVisibility }),
    setDensity: (density) => set({ density }),
  }));
}

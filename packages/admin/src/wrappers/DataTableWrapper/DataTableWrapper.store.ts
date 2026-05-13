import { createStore } from 'zustand/vanilla';
import type { DataTableState, DensitySize, FilterState, SortState } from './DataTableWrapper.types';

interface CreateTableStoreOptions {
  defaultPageSize: number;
}

export function createTableStore({ defaultPageSize }: CreateTableStoreOptions) {
  return createStore<DataTableState>()((set, get) => ({
    page: 1,
    pageSize: defaultPageSize,
    search: '',
    sort: [] as SortState[],
    filters: {} as FilterState,
    selection: new Set<string | number>(),
    columnVisibility: {} as Record<string, boolean>,
    columnOrder: [] as string[],
    density: 'md' as DensitySize,

    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    setSearch: (search) => set({ search, page: 1 }),
    setSort: (sort) => set({ sort, page: 1 }),

    // Toggles a field through: unsorted → asc → desc → unsorted.
    // If the field is not in the current sort array, it is appended as asc (new secondary).
    // If it is the only sort, cycling to unsorted clears the array.
    toggleSort: (field) => {
      const current = get().sort;
      const existing = current.find((s) => s.field === field);
      if (!existing) {
        set({ sort: [...current, { field, direction: 'asc' }], page: 1 });
        return;
      }
      if (existing.direction === 'asc') {
        set({ sort: current.map((s) => s.field === field ? { field, direction: 'desc' } : s), page: 1 });
        return;
      }
      // direction === 'desc' → remove
      const next = current.filter((s) => s.field !== field);
      set({ sort: next, page: 1 });
    },

    setFilters: (filters) => set({ filters, page: 1 }),
    setSelection: (selection) => set({ selection }),
    toggleColumn: (key, visible) =>
      set((s) => ({ columnVisibility: { ...s.columnVisibility, [key]: visible } })),
    setColumnOrder: (columnOrder) => set({ columnOrder }),
    setDensity: (density) => set({ density }),

    reset: () =>
      set((s) => ({
        page: 1,
        pageSize: defaultPageSize,
        search: '',
        sort: [],
        filters: {},
        selection: new Set<string | number>(),
        density: 'md',
        // UI preferences preserved across resets
        columnVisibility: s.columnVisibility,
        columnOrder: s.columnOrder,
      })),
  }));
}

export type TableStore = ReturnType<typeof createTableStore>;

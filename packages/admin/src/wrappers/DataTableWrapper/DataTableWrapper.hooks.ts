import { useCallback } from 'react';
import { useStore } from 'zustand/react';
import { useQueryClient } from '@tanstack/react-query';
import { useDataTableDataContext, useDataTableStoreContext } from './DataTableWrapper.context';
import type { DataTableDataContextValue, DataTableState } from './DataTableWrapper.types';

/**
 * Returns row data, loading state, error state, refetch, and pagination meta.
 * Re-renders whenever rows, loading, or error state changes.
 * Throws if called outside <DataTableWrapper>.
 */
export function useTableData<T = unknown>(): DataTableDataContextValue<T> {
  return useDataTableDataContext<T>();
}

/**
 * Returns a bound selector function pre-wired to this instance's Zustand store.
 * Call the returned function at the top level of your component with a selector.
 * Throws if called outside <DataTableWrapper>.
 *
 * @example
 * const useTable = useTableStore();
 * const page = useTable((s) => s.page);
 * const setPage = useTable((s) => s.setPage);
 * const sort = useTable((s) => s.sort);        // SortState[]
 * const toggleSort = useTable((s) => s.toggleSort);
 */
export function useTableStore(): <U>(selector: (state: DataTableState) => U) => U {
  const { store } = useDataTableStoreContext();
  // The returned function is called unconditionally at the top level of consumer
  // components — useStore inside it is a valid hook call at render time.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return <U,>(selector: (state: DataTableState) => U): U => useStore(store, selector);
}

/**
 * Returns a stable function that invalidates this table's React Query cache entry.
 * Safe to call from mutation handlers to trigger an immediate refetch.
 * Throws if called outside <DataTableWrapper>.
 *
 * @example
 * const invalidate = useInvalidateTable();
 * await api.del({ endpoint: '/users/', id: String(id) });
 * invalidate();
 */
export function useInvalidateTable(): () => void {
  const { parsedQueryKey } = useDataTableStoreContext();
  const queryClient = useQueryClient();
  return useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: parsedQueryKey });
  }, [queryClient, parsedQueryKey]);
}

/**
 * Returns helpers for row selection bound to this table's store.
 * Throws if called outside <DataTableWrapper>.
 *
 * @example
 * const { select, deselect, toggle, selectPage, clearSelection, isAllPageSelected } =
 *   useTableSelection();
 * const ids = rows.map(r => r.id);
 * <Checkbox checked={isAllPageSelected(ids)} onChange={() => selectPage(ids)} />
 */
export function useTableSelection() {
  const { store } = useDataTableStoreContext();

  const setSelection = useCallback(
    (next: Set<string | number>) => store.getState().setSelection(next),
    [store]
  );

  const toggle = useCallback(
    (id: string | number) => {
      const current = store.getState().selection;
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      store.getState().setSelection(next);
    },
    [store]
  );

  const selectPage = useCallback(
    (ids: Array<string | number>) => {
      const current = store.getState().selection;
      const next = new Set(current);
      for (const id of ids) next.add(id);
      store.getState().setSelection(next);
    },
    [store]
  );

  const deselectPage = useCallback(
    (ids: Array<string | number>) => {
      const current = store.getState().selection;
      const next = new Set(current);
      for (const id of ids) next.delete(id);
      store.getState().setSelection(next);
    },
    [store]
  );

  const clearSelection = useCallback(() => {
    store.getState().setSelection(new Set());
  }, [store]);

  const isAllPageSelected = useCallback(
    (ids: Array<string | number>): boolean => {
      const current = store.getState().selection;
      return ids.length > 0 && ids.every((id) => current.has(id));
    },
    [store]
  );

  return {
    toggle,
    selectPage,
    deselectPage,
    clearSelection,
    isAllPageSelected,
    setSelection,
  };
}

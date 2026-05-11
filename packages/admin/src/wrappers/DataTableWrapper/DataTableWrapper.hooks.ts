import { useContext } from 'react';
import { useStore } from 'zustand';
import { useQueryClient } from '@tanstack/react-query';
import { DataContext, StoreContext } from './DataTableWrapper.context';
import type { DataContextValue, DataTableStoreState } from './DataTableWrapper.types';

export function useDataTableContext<T = unknown>(): DataContextValue<T> {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useDataTableContext must be used inside a DataTableWrapper');
  }
  return ctx as DataContextValue<T>;
}

// Selector-based hook — always subscribe to the minimum slice to prevent excess re-renders
export function useDataTableStore<U>(selector: (state: DataTableStoreState) => U): U {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useDataTableStore must be used inside a DataTableWrapper');
  }
  return useStore(store, selector);
}

// Cache invalidation lives here (requires QueryClient — only exists inside React tree)
export function useInvalidateTable(queryKey: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: [queryKey] });
}

import { createContext, useContext } from 'react';
import type {
  DataTableDataContextValue,
  DataTableStoreContextValue,
} from './DataTableWrapper.types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DataTableDataContext = createContext<DataTableDataContextValue<any> | null>(null);
DataTableDataContext.displayName = 'DataTableDataContext';

export const DataTableStoreContext = createContext<DataTableStoreContextValue | null>(null);
DataTableStoreContext.displayName = 'DataTableStoreContext';

export function useDataTableDataContext<T = unknown>(): DataTableDataContextValue<T> {
  const ctx = useContext(DataTableDataContext);
  if (!ctx) throw new Error('useTableData must be used inside <DataTableWrapper>');
  return ctx as DataTableDataContextValue<T>;
}

export function useDataTableStoreContext(): DataTableStoreContextValue {
  const ctx = useContext(DataTableStoreContext);
  if (!ctx) throw new Error('useTableStore must be used inside <DataTableWrapper>');
  return ctx;
}

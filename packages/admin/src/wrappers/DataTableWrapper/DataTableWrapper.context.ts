import { createContext } from 'react';
import type { DataContextValue, DataTableStoreInstance } from './DataTableWrapper.types';

// Changes when React Query fetches (rows, loading, error states)
export const DataContext = createContext<DataContextValue<unknown> | null>(null);

// Passes the Zustand store instance — consumers call useStore(storeInstance, selector)
export const StoreContext = createContext<DataTableStoreInstance | null>(null);

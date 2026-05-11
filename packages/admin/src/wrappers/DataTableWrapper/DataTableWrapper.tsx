import React, { useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataContext, StoreContext } from './DataTableWrapper.context';
import { createDataTableStore } from './DataTableWrapper.store';
import type { DataTableWrapperProps, DataContextValue } from './DataTableWrapper.types';

export function DataTableWrapper<T = unknown>({
  queryKey,
  queryGetFn,
  pageSizes,
  paginationResponseFn,
  forceFilter,
  children,
}: DataTableWrapperProps<T>) {
  // Instance-scoped store — created once per mount, never recreated
  const storeRef = useRef(createDataTableStore(pageSizes?.[0] ?? 20));

  const store = storeRef.current;
  const state = store.getState();

  const queryParams = useMemo(() => ({
    page: state.page,
    pageSize: state.pageSize,
    search: state.search || undefined,
    sort: state.sort?.key,
    direction: state.sort?.direction,
    ...state.filters.reduce<Record<string, unknown>>((acc, f) => {
      acc[f.key] = f.value;
      return acc;
    }, {}),
    ...forceFilter,
  }), [state.page, state.pageSize, state.search, state.sort, state.filters, forceFilter]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [queryKey, queryParams],
    queryFn: () => queryGetFn(queryParams),
  });

  const total = useMemo(() => {
    if (!data) return 0;
    if (paginationResponseFn) return paginationResponseFn(data).total;
    return (data.data as T[] | null)?.length ?? 0;
  }, [data, paginationResponseFn]);

  const dataContextValue = useMemo<DataContextValue<T>>(
    () => ({
      rows: (data?.data as T[]) ?? [],
      isLoading,
      isError,
      total,
      refetch,
    }),
    [data, isLoading, isError, total, refetch]
  );

  return (
    <DataContext.Provider value={dataContextValue as DataContextValue<unknown>}>
      <StoreContext.Provider value={store}>
        {children}
      </StoreContext.Provider>
    </DataContext.Provider>
  );
}

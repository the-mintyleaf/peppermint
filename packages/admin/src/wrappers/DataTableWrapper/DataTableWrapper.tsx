'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStore } from 'zustand/react';
import { DataTableDataContext, DataTableStoreContext } from './DataTableWrapper.context';
import { createTableStore } from './DataTableWrapper.store';
import { clientPaginate, clientSearch, clientSort, getNestedValue } from './DataTableWrapper.utils';
import type {
  DataTableDataContextValue,
  DataTableStoreContextValue,
  DataTableWrapperProps,
  PaginationMeta,
  QueryParams,
} from './DataTableWrapper.types';

export function DataTableWrapper<T = unknown>({
  queryKey,
  queryGetFn,
  dataKey,
  paginationKey,
  enableServerQuery = false,
  defaultPageSize = 20,
  staleTime = 1000 * 60 * 5,
  debounceMs = 300,
  forceFilters,
  persistence,
  onError,
  children,
}: DataTableWrapperProps<T>) {
  // Store created once at mount via lazy ref guard — avoids useState double-render
  const storeRef = useRef<ReturnType<typeof createTableStore> | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createTableStore({ defaultPageSize });
  }
  const store = storeRef.current;

  // Prop refs — props read inside callbacks captured here to avoid stale closures
  // without expanding useCallback/useMemo dependency arrays
  const queryGetFnRef = useRef(queryGetFn);
  queryGetFnRef.current = queryGetFn;
  const dataKeyRef = useRef(dataKey);
  dataKeyRef.current = dataKey;
  const paginationKeyRef = useRef(paginationKey);
  paginationKeyRef.current = paginationKey;
  const forceFiltersRef = useRef(forceFilters);
  forceFiltersRef.current = forceFilters;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // Parsed query key — stable as long as the queryKey string doesn't change
  const parsedKey = useMemo(() => queryKey.split('.'), [queryKey]);

  // Subscribe to query-relevant store slices.
  // useStore from zustand/react wires the React subscription so the component
  // re-renders when these values change, giving React Query a new key.
  const page = useStore(store, (s) => s.page);
  const pageSize = useStore(store, (s) => s.pageSize);
  const search = useStore(store, (s) => s.search);
  const sort = useStore(store, (s) => s.sort);
  const filters = useStore(store, (s) => s.filters);

  // Debounced search and filters for the React Query key.
  // The store updates immediately (so local UI like a search input stays snappy),
  // but the query only fires after the user stops typing for debounceMs.
  // Debounce only applies when enableServerQuery is true — client-side filtering
  // is synchronous and cheap, so it runs against the live value.
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enableServerQuery) return;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setDebouncedFilters(filters);
    }, debounceMs);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [search, filters, enableServerQuery, debounceMs]);

  // Rehydrate persisted UI preferences from localStorage on mount
  useEffect(() => {
    if (!persistence) return;
    const key = persistence.storageKey ?? queryKey;
    const targets = persistence.persist ?? ['columnVisibility', 'columnOrder', 'density'];
    try {
      const raw = localStorage.getItem(`dtw:${key}`);
      if (!raw) return;
      const saved = JSON.parse(raw) as Record<string, unknown>;
      const { getState } = store;
      if (targets.includes('columnVisibility') && saved.columnVisibility) {
        getState().toggleColumn; // verify store is ready
        store.setState({ columnVisibility: saved.columnVisibility as Record<string, boolean> });
      }
      if (targets.includes('columnOrder') && Array.isArray(saved.columnOrder)) {
        store.setState({ columnOrder: saved.columnOrder as string[] });
      }
      if (targets.includes('density') && saved.density) {
        store.setState({ density: saved.density as import('./DataTableWrapper.types').DensitySize });
      }
    } catch {
      // Corrupted localStorage — silently ignore, defaults apply
    }
  // Run once on mount only
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist UI preferences to localStorage whenever they change
  const columnVisibility = useStore(store, (s) => s.columnVisibility);
  const columnOrder = useStore(store, (s) => s.columnOrder);
  const density = useStore(store, (s) => s.density);

  useEffect(() => {
    if (!persistence) return;
    const key = persistence.storageKey ?? queryKey;
    const targets = persistence.persist ?? ['columnVisibility', 'columnOrder', 'density'];
    try {
      const toSave: Record<string, unknown> = {};
      if (targets.includes('columnVisibility')) toSave.columnVisibility = columnVisibility;
      if (targets.includes('columnOrder')) toSave.columnOrder = columnOrder;
      if (targets.includes('density')) toSave.density = density;
      localStorage.setItem(`dtw:${key}`, JSON.stringify(toSave));
    } catch {
      // localStorage unavailable (SSR, private mode quota exceeded) — silently ignore
    }
  }, [columnVisibility, columnOrder, density, persistence, queryKey]);

  // sort is stringified in the key — RQ uses === for comparison, and array/object
  // references always differ even when content is the same.
  const sortKey = JSON.stringify(sort);
  const activeSearch = enableServerQuery ? debouncedSearch : search;
  const activeFilters = enableServerQuery ? debouncedFilters : filters;
  const filtersKey = JSON.stringify(activeFilters);

  const fullQueryKey = enableServerQuery
    ? [...parsedKey, page, pageSize, activeSearch, sortKey, filtersKey]
    : parsedKey;

  const {
    data: rawData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: fullQueryKey,
    queryFn: async () => {
      const params: QueryParams | undefined = enableServerQuery
        ? {
            page,
            pageSize,
            search: debouncedSearch,
            sort,
            filters: { ...debouncedFilters, ...forceFiltersRef.current },
          }
        : undefined;
      return queryGetFnRef.current(params);
    },
    staleTime,
  });

  // Fire onError synchronously on the first error transition — avoids useEffect lag
  const prevIsError = useRef(false);
  if (isError && !prevIsError.current) {
    prevIsError.current = true;
    onErrorRef.current?.(new Error('DataTableWrapper query failed'));
  } else if (!isError) {
    prevIsError.current = false;
  }

  // Extract rows array from response using dot-path dataKey
  const allRows = useMemo(() => {
    if (!rawData) return [] as T[];
    const extracted = dataKeyRef.current
      ? getNestedValue(rawData, dataKeyRef.current)
      : rawData;
    return Array.isArray(extracted) ? (extracted as T[]) : ([] as T[]);
  }, [rawData]);

  // Extract server-reported total from paginationKey path (looks for a `total` field)
  const serverTotal = useMemo(() => {
    if (!rawData || !paginationKeyRef.current) return 0;
    const meta = getNestedValue(rawData, paginationKeyRef.current);
    if (meta != null && typeof meta === 'object' && 'total' in (meta as object)) {
      return Number((meta as Record<string, unknown>).total) || 0;
    }
    return 0;
  }, [rawData]);

  // Client-side processing pipeline — search → sort → paginate.
  // Uses live (non-debounced) values so local filtering feels instant.
  const processedRows = useMemo<T[]>(() => {
    if (enableServerQuery) return allRows;
    return clientSort(clientSearch(allRows, search), sort);
  }, [allRows, enableServerQuery, search, sort]);

  const rows = useMemo<T[]>(() => {
    if (enableServerQuery) return allRows;
    return clientPaginate(processedRows, page, pageSize);
  }, [processedRows, enableServerQuery, allRows, page, pageSize]);

  const total = enableServerQuery ? serverTotal : processedRows.length;

  const paginationMeta = useMemo<PaginationMeta>(
    () => ({
      page,
      pageSize,
      total,
      totalPages: Math.max(Math.ceil(total / pageSize), 1),
    }),
    [page, pageSize, total]
  );

  const stableRefetch = useCallback(() => {
    void refetch();
  }, [refetch]);

  const dataValue = useMemo<DataTableDataContextValue<T>>(
    () => ({
      rows,
      total,
      isLoading,
      isFetching,
      isError,
      refetch: stableRefetch,
      paginationMeta,
    }),
    [rows, total, isLoading, isFetching, isError, stableRefetch, paginationMeta]
  );

  // storeValue is stable — only the store ref and static parsed key are passed.
  // Consumers subscribe to specific slices via useTableStore(), not this context value.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const storeValue = useMemo<DataTableStoreContextValue>(() => ({ store, parsedQueryKey: parsedKey }), []);

  return (
    <DataTableDataContext.Provider value={dataValue}>
      <DataTableStoreContext.Provider value={storeValue}>
        {children}
      </DataTableStoreContext.Provider>
    </DataTableDataContext.Provider>
  );
}

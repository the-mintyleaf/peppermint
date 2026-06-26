import type { ReactNode } from "react";
import type { StoreApi } from "zustand/vanilla";

export type SortDirection = "asc" | "desc";

export interface SortState {
  field: string;
  direction: SortDirection;
}

export type FilterState = Record<string, unknown>;

export type DensitySize = "xs" | "sm" | "md" | "lg" | "xl";

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface QueryParams {
  page: number;
  pageSize: number;
  search: string;
  /** Primary sort first, secondary sort second. */
  sort: SortState[];
  filters: FilterState;
}

export interface DataTableState {
  page: number;
  pageSize: number;
  search: string;
  /** Ordered array — index 0 is primary sort, index 1 is secondary sort, etc. */
  sort: SortState[];
  filters: FilterState;
  selection: Set<string | number>;
  columnVisibility: Record<string, boolean>;
  /** Ordered column keys — determines render order. Empty means use default order. */
  columnOrder: string[];
  density: DensitySize;

  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSearch: (search: string) => void;
  /** Replaces the full sort array. Pass [] to clear. */
  setSort: (sort: SortState[]) => void;
  /** Toggles a field's sort direction or adds it as a new sort level. */
  toggleSort: (field: string) => void;
  setFilters: (filters: FilterState) => void;
  setSelection: (selection: Set<string | number>) => void;
  toggleColumn: (key: string, visible: boolean) => void;
  setColumnOrder: (order: string[]) => void;
  setDensity: (density: DensitySize) => void;
  reset: () => void;
}

export interface DataTableDataContextValue<T = unknown> {
  rows: T[];
  total: number;
  isLoading: boolean;
  isFetching: boolean;
  /** True while search/filter changes are waiting for the debounce timer to fire (server mode only). */
  isDebouncing: boolean;
  isError: boolean;
  refetch: () => void;
  paginationMeta: PaginationMeta;
}

export interface DataTableStoreContextValue {
  store: StoreApi<DataTableState>;
  parsedQueryKey: readonly string[];
}

export interface TablePersistenceOptions {
  /** localStorage key prefix. Defaults to the table's queryKey. */
  storageKey?: string;
  /** Which slices to persist. Defaults to all three. */
  persist?: Array<"columnVisibility" | "columnOrder" | "density">;
}

export interface DataTableWrapperProps<T = unknown> {
  /** Query key: either dot-notation string (e.g. 'users.list') or array (e.g. ['users', 'list']) */
  queryKey: string | readonly string[];
  queryGetFn: (params?: QueryParams) => Promise<unknown>;
  /** Dot-notation path into the response to reach the rows array, e.g. 'data.items' */
  dataKey?: string;
  /** Dot-notation path to object containing a `total` field, e.g. 'meta' */
  paginationKey?: string;
  enableServerQuery?: boolean;
  defaultPageSize?: number;
  pageSizes?: number[];
  staleTime?: number;
  /**
   * Debounce delay in ms applied to search and filter changes before React Query
   * sees a new key and fires a request. Only meaningful with enableServerQuery.
   * Defaults to 300ms.
   */
  debounceMs?: number;
  /** Always merged into every server query — never reset by the store */
  forceFilters?: FilterState;
  onError?: (error: Error) => void;
  /**
   * When set, columnVisibility, columnOrder, and density are persisted to
   * localStorage and rehydrated on mount.
   */
  persistence?: TablePersistenceOptions;
  children: ReactNode;
}

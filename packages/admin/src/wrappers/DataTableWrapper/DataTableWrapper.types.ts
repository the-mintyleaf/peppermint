import type { StoreApi } from 'zustand';
import type { ApiResponse, PaginationData } from '@zetsel/api-client';

// --- UI / shell types ---

export interface ColumnDef<T> {
  key: keyof T & string;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  width?: number | string;
}

export interface FilterDef {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'boolean';
  options?: { value: string; label: string }[];
}

export interface ActionDef<T> {
  label: string;
  onClick: (row: T) => void;
  icon?: React.ReactNode;
  hidden?: (row: T) => boolean;
}

export interface RowExpansionDef<T> {
  render: (row: T) => React.ReactNode;
}

export interface ModuleInfo {
  title: string;
  description?: string;
}

// --- Store state ---

export interface SortState {
  key: string;
  direction: 'asc' | 'desc';
}

export interface FilterState {
  key: string;
  value: unknown;
}

export interface DataTableStoreState {
  page: number;
  pageSize: number;
  search: string;
  filters: FilterState[];
  sort: SortState | null;
  selectedIds: Array<string | number>;
  columnVisibility: Record<string, boolean>;
  density: 'compact' | 'normal' | 'spacious';

  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearch: (search: string) => void;
  setFilters: (filters: FilterState[]) => void;
  setSort: (sort: SortState | null) => void;
  toggleRow: (id: string | number) => void;
  selectAll: (ids: Array<string | number>) => void;
  clearSelection: () => void;
  setColumnVisibility: (visibility: Record<string, boolean>) => void;
  setDensity: (density: DataTableStoreState['density']) => void;
}

// --- Context value types ---

export interface DataContextValue<T = unknown> {
  rows: T[];
  isLoading: boolean;
  isError: boolean;
  total: number;
  refetch: () => void;
}

export type DataTableStoreInstance = StoreApi<DataTableStoreState>;

// --- Wrapper props ---

export interface DataTableWrapperProps<T = unknown> {
  queryKey: string;
  queryGetFn: (params?: Record<string, unknown>) => Promise<ApiResponse<T[]>>;
  pageSizes?: number[];
  enableServerQuery?: boolean;
  paginationResponseFn?: (response: unknown) => PaginationData;
  forceFilter?: Record<string, unknown>;
  children: React.ReactNode;
}

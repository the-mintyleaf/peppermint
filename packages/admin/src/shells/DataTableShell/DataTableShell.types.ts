import type { ApiResponse } from '@zetsel/api-client';
import type {
  ColumnDef,
  FilterDef,
  ActionDef,
  RowExpansionDef,
  ModuleInfo,
} from '../../wrappers/DataTableWrapper';

export type { ColumnDef, FilterDef, ActionDef, RowExpansionDef, ModuleInfo };

export interface DataTableShellProps<T = unknown> {
  moduleInfo: ModuleInfo;
  queryKey: string;
  queryGetFn: (params?: Record<string, unknown>) => Promise<ApiResponse<T[]>>;
  columns: ColumnDef<T>[];
  idAccessor: keyof T & string;

  newButtonHref?: string;
  onNewClick?: () => void;
  onEditClick?: (id: string | number, row: T) => void;
  onDeleteClick?: (ids: Array<string | number>) => void;

  filterList?: FilterDef[];
  /** Always applied to queries; never shown in UI */
  forceFilter?: Record<string, unknown>;
  pageSizes?: number[];
  hideFilters?: boolean;
  rowExpansion?: RowExpansionDef<T>;
  enableServerQuery?: boolean;
  paginationResponseFn?: (response: unknown) => import('@zetsel/api-client').PaginationData;
}

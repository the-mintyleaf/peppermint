import type React from 'react';
import type { ApiResponse } from '@zetsel/api-client';
import type { ColumnDef, FilterDef, ModuleInfo } from '../../wrappers/DataTableWrapper';
import type { FormValues } from '../../wrappers/FormWrapper';

export interface DataTableModalShellProps<T = unknown, TCreate extends FormValues = FormValues, TEdit extends FormValues = FormValues> {
  moduleInfo: ModuleInfo;
  queryKey: string;
  queryGetFn: (params?: Record<string, unknown>) => Promise<ApiResponse<T[]>>;
  columns: ColumnDef<T>[];
  idAccessor: keyof T & string;

  onCreateApi: (data: TCreate) => Promise<ApiResponse<unknown>>;
  onEditApi: (id: string | number, data: TEdit) => Promise<ApiResponse<unknown>>;
  onDeleteApi: (id: string | number) => Promise<ApiResponse<void>>;

  createFormComponent: React.ComponentType;
  editFormComponent: React.ComponentType<{ record: T }>;

  createInitial: TCreate;
  editInitial: (record: T) => TEdit;

  filterList?: FilterDef[];
  modalSize?: string | number;
  pageSizes?: number[];

  onCreateSuccess?: (data: unknown) => void;
  onEditSuccess?: (data: unknown) => void;
  onDeleteSuccess?: () => void;
}

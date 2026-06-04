import type { DataTableShellProps, DataTableShellModuleInfo } from '../DataTableShell';

export interface ModalFormComponentProps<T extends Record<string, unknown>> {
  initialValues?: Partial<T>;
  onSubmit: (values: T) => void;
  isLoading: boolean;
}

export interface ModalTableShellContextValue<T extends Record<string, unknown>> {
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  activeEditRecord: T | null;
  editLoading: boolean;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (record: T) => void;
  closeEditModal: () => void;
  setEditLoading: (loading: boolean) => void;
  setActiveEditRecord: (record: T | null) => void;
}

export interface ModalHandlerProps<T extends Record<string, unknown>> {
  queryKey: string;
  moduleInfo: DataTableShellModuleInfo;
  modalWidth?: number | string;
  createModalTitle?: string;
  editModalTitle?: string;
  createFormComponent?: React.ComponentType<ModalFormComponentProps<T>>;
  editFormComponent?: React.ComponentType<ModalFormComponentProps<T>>;
  onCreateApi?: (values: unknown) => Promise<unknown>;
  onEditApi?: (values: unknown, record: T) => Promise<unknown>;
  transformOnCreate?: (values: T) => unknown;
  transformOnEdit?: (values: T, record: T) => unknown;
  onCreateSuccess?: (result: unknown) => void;
  onEditSuccess?: (result: unknown) => void;
}

export type ModalTableShellProps<T extends Record<string, unknown>> = Omit<
  DataTableShellProps<T>,
  | 'sustained'
  | 'basePath'
  | 'onNewClick'
  | 'onEditClick'
  | 'onDeleteClick'
  | 'disableCreateButton'
  | 'disableEditButton'
  | 'disableDeleteButton'
> & {
  modalWidth?: number | string;
  createModalTitle?: string;
  editModalTitle?: string;
  createFormComponent?: React.ComponentType<ModalFormComponentProps<T>>;
  editFormComponent?: React.ComponentType<ModalFormComponentProps<T>>;
  onCreateApi?: (values: unknown) => Promise<unknown>;
  onEditApi?: (values: unknown, record: T) => Promise<unknown>;
  onDeleteApi?: (id: string | number) => Promise<unknown>;
  onCreateSuccess?: (result: unknown) => void;
  onEditSuccess?: (result: unknown) => void;
  onDeleteSuccess?: () => void;
  onEditTrigger?: (record: T) => Promise<T>;
  transformOnCreate?: (values: T) => unknown;
  transformOnEdit?: (values: T, record: T) => unknown;
  transformOnDelete?: (id: string | number) => unknown;
};

import type {
  DataTableShellProps,
  DataTableShellModuleInfo,
} from "../DataTableShell";

/**
 * Props a create/edit form component receives from the shell. `TRecord` is the
 * table row (used to prefill an edit form); `TFormValues` is the form's own value
 * shape (what `onSubmit` emits). Keeping them separate removes the `as unknown as`
 * casts consumers needed when a form's values differed from the row.
 */
export interface ModalFormComponentProps<TRecord, TFormValues = TRecord> {
  initialValues?: Partial<TRecord>;
  onSubmit: (values: TFormValues) => void;
  isLoading: boolean;
}

export interface ModalTableShellContextValue<
  T extends Record<string, unknown>,
> {
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

export interface ModalHandlerProps<
  TRow extends Record<string, unknown>,
  TCreate = TRow,
  TEdit = TCreate,
> {
  queryKey: string | readonly string[];
  moduleInfo: DataTableShellModuleInfo;
  modalWidth?: number | string;
  createModalTitle?: string;
  editModalTitle?: string;
  createFormComponent?: React.ComponentType<
    ModalFormComponentProps<TRow, TCreate>
  >;
  editFormComponent?: React.ComponentType<ModalFormComponentProps<TRow, TEdit>>;
  onCreateApi?: (values: TCreate) => Promise<unknown>;
  onEditApi?: (values: TEdit, record: TRow) => Promise<unknown>;
  transformOnCreate?: (values: TCreate) => TCreate;
  transformOnEdit?: (values: TEdit, record: TRow) => TEdit;
  onCreateSuccess?: (result: unknown) => void;
  onEditSuccess?: (result: unknown) => void;
  getErrorMessage?: (error: unknown) => string;
}

export type ModalTableShellProps<
  TRow extends Record<string, unknown>,
  TCreate = TRow,
  TEdit = TCreate,
> = Omit<
  DataTableShellProps<TRow>,
  | "sustained"
  | "onNewClick"
  | "onEditClick"
  | "onDeleteClick"
  | "disableCreateButton"
  | "disableEditButton"
  | "disableDeleteButton"
> & {
  modalWidth?: number | string;
  createModalTitle?: string;
  editModalTitle?: string;
  createFormComponent?: React.ComponentType<
    ModalFormComponentProps<TRow, TCreate>
  >;
  editFormComponent?: React.ComponentType<ModalFormComponentProps<TRow, TEdit>>;
  onCreateApi?: (values: TCreate) => Promise<unknown>;
  onEditApi?: (values: TEdit, record: TRow) => Promise<unknown>;
  onDeleteApi?: (id: string | number) => Promise<unknown>;
  onCreateSuccess?: (result: unknown) => void;
  onEditSuccess?: (result: unknown) => void;
  onDeleteSuccess?: () => void;
  onEditTrigger?: (record: TRow) => Promise<TRow>;
  transformOnCreate?: (values: TCreate) => TCreate;
  transformOnEdit?: (values: TEdit, record: TRow) => TEdit;
  transformOnDelete?: (id: string | number) => unknown;
  getErrorMessage?: (error: unknown) => string;
};

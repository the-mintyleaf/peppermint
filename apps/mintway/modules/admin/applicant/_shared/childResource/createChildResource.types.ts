import type { ComponentType } from "react";
import type {
  DataTableShellColumn,
  DataTableShellModuleInfo,
  ModalFormComponentProps,
  QueryParams,
} from "@peppermint/admin";

export interface ChildResourceListResponse<TRow> {
  data: TRow[];
  meta: { total: number } & Record<string, unknown>;
}

/**
 * Config for one nested applicant child resource (§5, §8). `slug` is the URL segment
 * under `/api/v1/applicants/:applicantId/` (e.g. `"emergency-contacts"`). The factory
 * derives the scoped REST client, query keys, and a `ModalTableShell` from this.
 */
export interface ChildResourceConfig<
  TRow extends object,
  TCreate extends object = TRow,
  TEdit extends object = TCreate,
> {
  slug: string;
  moduleInfo: DataTableShellModuleInfo;
  columns: DataTableShellColumn<TRow>[];
  createFormComponent: ComponentType<ModalFormComponentProps<TRow, TCreate>>;
  /** Omit to reuse the create form for edits; pass a distinct one when they differ. */
  editFormComponent?: ComponentType<ModalFormComponentProps<TRow, TEdit>>;
  createModalTitle?: string;
  editModalTitle?: string;
  modalWidth?: number | string;
  defaultPageSize?: number;
  /** Append-only resources (e.g. qualification assessments) disable edit. */
  disableEdit?: boolean;
  /** Append-only / immutable resources disable delete. */
  disableDelete?: boolean;
  /** Optional server-param overrides merged into every list request. */
  defaultParams?: Record<string, unknown>;
  /** Map form values before create (e.g. drop empty strings). */
  transformCreate?: (values: TCreate) => TCreate;
  transformEdit?: (values: TEdit, record: TRow) => TEdit;
}

export interface ChildResourceSectionProps {
  applicantId: string;
}

export type ChildResourceListFn<TRow> = (
  params?: QueryParams,
) => Promise<ChildResourceListResponse<TRow>>;

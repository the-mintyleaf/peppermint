import type { ModalTableShellProps } from "@peppermint/admin";
import type { ModuleHeaderBreadcrumbItem } from "@peppermint/ui";

export interface ListModuleConfig<
  TRow extends object,
  TCreate = TRow,
  TEdit = TCreate,
> extends ModalTableShellProps<TRow, TCreate, TEdit> {
  /** Breadcrumb items rendered in the ModuleHeader above the table. */
  breadcrumb: ModuleHeaderBreadcrumbItem[];
  /** Gate the module behind staff access. Defaults to true. */
  requireStaff?: boolean;
}

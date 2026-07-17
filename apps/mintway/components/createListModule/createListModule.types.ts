import type { ModalTableShellProps } from "@peppermint/admin";

export interface ListModuleConfig<
  TRow extends object,
  TCreate = TRow,
  TEdit = TCreate,
> extends ModalTableShellProps<TRow, TCreate, TEdit> {
  /** Gate the module behind staff access. Defaults to true. */
  requireStaff?: boolean;
}

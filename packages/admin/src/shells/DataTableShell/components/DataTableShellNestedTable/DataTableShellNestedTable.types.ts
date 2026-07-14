import type { DataTableColumn } from "mantine-datatable";

export interface DataTableShellNestedTableProps<T extends object> {
  records: T[];
  columns: DataTableColumn<T>[];
  idAccessor?: string;
  /** Left indent — use for 2nd-level and deeper nesting */
  indentLeft?: number;
}

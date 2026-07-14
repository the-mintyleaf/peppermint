"use client";

import { DataTable } from "mantine-datatable";
import type { DataTableShellNestedTableProps } from "./DataTableShellNestedTable.types";

export function DataTableShellNestedTable<T extends object>({
  records,
  columns,
  idAccessor = "id",
  indentLeft,
}: DataTableShellNestedTableProps<T>) {
  return (
    <DataTable<T>
      noHeader
      striped
      withColumnBorders
      fz="xs"
      fw={500}
      horizontalSpacing={8}
      verticalSpacing={6}
      idAccessor={idAccessor as keyof T & string}
      columns={columns}
      records={records}
      ml={indentLeft}
    />
  );
}

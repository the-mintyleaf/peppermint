"use client";

import type { DataTableShellColumn } from "../shells/DataTableShell";
import { RowActionsMenu } from "./RowActionsMenu";
import type { RowAction } from "./RowActionsMenu";

export interface RowActionsColumnOptions<T> {
  actions: RowAction<T>[];
  title?: string;
  width?: number;
}

/**
 * A trailing "Actions" column rendering a {@link RowActionsMenu} per row.
 * Keeps the actions column identical across list modules.
 */
export function rowActionsColumn<T extends object>(
  options: RowActionsColumnOptions<T>,
): DataTableShellColumn<T> {
  const { actions, title = "", width = 60 } = options;
  return {
    accessor: "__actions",
    key: "actions",
    title,
    width,
    textAlign: "right",
    render: (record) => <RowActionsMenu record={record} actions={actions} />,
  } as DataTableShellColumn<T>;
}

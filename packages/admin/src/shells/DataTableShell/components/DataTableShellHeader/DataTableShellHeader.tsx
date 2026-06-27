"use client";

import { ManageHeader } from "@peppermint/ui";
import { useTableData } from "../../../../wrappers/DataTableWrapper";
import type { DataTableShellHeaderProps } from "../../DataTableShell.types";

export function DataTableShellHeader({
  moduleInfo,
}: DataTableShellHeaderProps) {
  const displayLabel = moduleInfo.label ?? moduleInfo.name;
  const { total } = useTableData();

  return (
    <ManageHeader
      title={`Manage ${displayLabel}`}
      count={total}
      description={moduleInfo.description}
    />
  );
}

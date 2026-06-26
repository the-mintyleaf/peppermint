"use client";

import { useState } from "react";
import { ColumnsIcon } from "@phosphor-icons/react/dist/csr/Columns";
import { useTableStore } from "../../../../wrappers/DataTableWrapper";
import type { DataTableShellColumn } from "../../DataTableShell.types";
import { ColumnToggleList } from "./ColumnToggleList";
import { ToolbarIconButton } from "./ToolbarIconButton";
import { getColumnKey, getColumnLabel } from "./toolbar.utils";

interface DataTableShellColumnsMenuProps<T extends Record<string, unknown>> {
  columns: DataTableShellColumn<T>[];
}

export function DataTableShellColumnsMenu<T extends Record<string, unknown>>({
  columns,
}: DataTableShellColumnsMenuProps<T>) {
  const [opened, setOpened] = useState(false);

  const useTable = useTableStore();
  const columnVisibility = useTable((s) => s.columnVisibility);
  const toggleColumn = useTable((s) => s.toggleColumn);

  const isColumnVisible = (key: string, defaultVisible = true): boolean => {
    if (!(key in columnVisibility)) return defaultVisible;
    return columnVisibility[key] !== false;
  };

  const handleResetColumns = () => {
    columns.forEach((col) => {
      const key = getColumnKey(col);
      toggleColumn(key, col.defaultVisible !== false);
    });
  };

  const columnToggles = columns.map((col) => {
    const key = getColumnKey(col);
    return {
      key,
      label: getColumnLabel(col),
      visible: isColumnVisible(key, col.defaultVisible !== false),
    };
  });

  return (
    <ToolbarIconButton
      label="Columns"
      icon={<ColumnsIcon size={18} />}
      opened={opened}
      onToggle={() => setOpened((v) => !v)}
      onClose={() => setOpened(false)}
      width={220}
    >
      <ColumnToggleList
        columnToggles={columnToggles}
        toggleColumn={toggleColumn}
        handleResetColumns={handleResetColumns}
      />
    </ToolbarIconButton>
  );
}

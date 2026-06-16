"use client";

import { ActionIcon, Menu } from "@zetsel/ui";
import { ArrowClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowClockwise";
import { DotsThreeIcon } from "@phosphor-icons/react/dist/csr/DotsThree";
import { DownloadSimpleIcon } from "@phosphor-icons/react/dist/csr/DownloadSimple";
import { useTableData } from "../../../../wrappers/DataTableWrapper";
import { DotsThreeVertical } from "@phosphor-icons/react";

const ITEM_STYLE = { fontSize: 10 };

function exportRowsToCsv(rows: Record<string, unknown>[], filename: string) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const csv = [
    keys.join(","),
    ...rows.map((row) =>
      keys.map((k) => JSON.stringify(row[k] ?? "")).join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

interface DataTableShellHeaderActionsProps {
  exportFilename?: string;
}

export function DataTableShellHeaderActions({
  exportFilename = "export",
}: DataTableShellHeaderActionsProps) {
  const { rows, refetch } = useTableData<Record<string, unknown>>();

  return (
    <Menu shadow="md" width={180} position="bottom-end">
      <Menu.Target>
        <ActionIcon
          color="brand"
          variant="light"
          size="md"
          aria-label="Table actions"
        >
          <DotsThreeVertical size={14} weight="bold" />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          leftSection={<ArrowClockwiseIcon size={12} />}
          style={ITEM_STYLE}
          onClick={() => refetch()}
        >
          Reload table
        </Menu.Item>

        <Menu.Item
          leftSection={<DownloadSimpleIcon size={12} />}
          style={ITEM_STYLE}
          onClick={() => exportRowsToCsv(rows, exportFilename)}
        >
          Export as CSV
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

"use client";

import { Group, Stack, Text } from "@zetsel/ui";
import { useTableData } from "../../../../wrappers/DataTableWrapper";
import type { DataTableShellHeaderProps } from "../../DataTableShell.types";

export function DataTableShellHeader({ moduleInfo }: DataTableShellHeaderProps) {
  const displayLabel = moduleInfo.label ?? moduleInfo.name;
  const { total } = useTableData();

  return (
    <Stack gap={2} visibleFrom="lg">
      <Group h={80} align="center" gap="xs">
        <Text size="2rem" fw={400}>
          Manage {displayLabel}
        </Text>
        <Text size="2rem" fw={400} opacity={0.3}>
          {total}
        </Text>
      </Group>
    </Stack>
  );
}

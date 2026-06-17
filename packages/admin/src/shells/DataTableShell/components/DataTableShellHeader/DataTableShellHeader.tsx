"use client";

import { Group, Stack, Text } from "@peppermint/ui";
import { useTableData } from "../../../../wrappers/DataTableWrapper";
import type { DataTableShellHeaderProps } from "../../DataTableShell.types";

export function DataTableShellHeader({ moduleInfo }: DataTableShellHeaderProps) {
  const displayLabel = moduleInfo.label ?? moduleInfo.name;
  const { total } = useTableData();

  return (
    <Stack gap={2} visibleFrom="lg">
      <Group h={80} align="center" gap="xs">
        <Text size="1.6rem" fw={500}>
          Manage {displayLabel}
        </Text>
        <Text size="1.5rem" fw={400} opacity={0.3}>
          {total}
        </Text>
      </Group>
    </Stack>
  );
}

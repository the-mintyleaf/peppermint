"use client";

import { Box, Group, Text } from "@peppermint/ui";
import type { DetailFieldProps } from "./DetailField.types";

/**
 * One label/value row in the flat profile property list. A fixed-width dimmed
 * label sits left, the value left-aligned beside it so every row's values line
 * up into a single column. Strings render as `Text`; a passed node (badge,
 * link, the stage switch) renders as-is. Empty values show a dimmed em-dash so
 * the row still reads as "known field, nothing on file" — a fact, not an action.
 */
export function DetailField({ label, value }: DetailFieldProps) {
  const isEmpty = value === null || value === undefined || value === "";
  const isText = typeof value === "string" || typeof value === "number";

  return (
    <Group wrap="nowrap" gap="md" align="flex-start">
      <Text w={132} c="dimmed" size="sm" style={{ flexShrink: 0 }}>
        {label}
      </Text>
      {isEmpty ? (
        <Text size="sm" c="dimmed">
          —
        </Text>
      ) : isText ? (
        <Text size="sm" fw={500} style={{ minWidth: 0 }}>
          {value}
        </Text>
      ) : (
        <Box style={{ flex: 1, minWidth: 0 }}>{value}</Box>
      )}
    </Group>
  );
}

"use client";

import { Box, Stack, Text } from "@peppermint/ui";
import type { DetailFieldProps } from "./DetailField.types";

/**
 * One label/value pair in the profile grid: a dimmed label stacked above its
 * value, so pairs tile cleanly into a two-column grid. Strings render as `Text`;
 * a passed node (badge, link, the stage switch) renders as-is. Empty values
 * show a dimmed em-dash so the pair still reads as "known field, nothing on
 * file" — a fact, not an action.
 */
export function DetailField({ label, value, size = "xs" }: DetailFieldProps) {
  const isEmpty = value === null || value === undefined || value === "";
  const isText = typeof value === "string" || typeof value === "number";

  return (
    <Stack gap={2}>
      <Text c="dimmed" size={size}>
        {label}
      </Text>
      {isEmpty ? (
        <Text size={size} c="dimmed">
          —
        </Text>
      ) : isText ? (
        <Text size={size} fw={500} style={{ minWidth: 0 }}>
          {value}
        </Text>
      ) : (
        <Box style={{ minWidth: 0 }}>{value}</Box>
      )}
    </Stack>
  );
}

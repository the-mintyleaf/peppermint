"use client";

import { Box, Group, Stack, Text } from "@peppermint/ui";
import type { DetailFieldProps } from "./DetailField.types";

/**
 * One label/value pair in the profile: a dimmed label on the left, its value
 * right-aligned opposite it. The drawer is a narrow column, so pairs read as a
 * property list rather than a grid — the label column stays put and the eye
 * runs down the values. Strings render as `Text`; a passed node (badge, link,
 * a phone list) renders as-is. Empty values show a dimmed em-dash so the pair
 * still reads as "known field, nothing on file" — a fact, not an action.
 *
 * `stacked` puts the value on its own line under the label, left-aligned and
 * newline-preserving: free text (a detail, a note) is read as prose, and prose
 * ragged down the right edge of a narrow drawer is not readable.
 */
export function DetailField({
  label,
  value,
  size = "xs",
  stacked = false,
}: DetailFieldProps) {
  const isEmpty = value === null || value === undefined || value === "";
  const isText = typeof value === "string" || typeof value === "number";

  if (stacked) {
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
          <Text size={size} style={{ whiteSpace: "pre-wrap" }}>
            {value}
          </Text>
        ) : (
          <Box style={{ minWidth: 0 }}>{value}</Box>
        )}
      </Stack>
    );
  }

  return (
    <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
      <Text c="dimmed" size={size} style={{ flexShrink: 0 }}>
        {label}
      </Text>
      {isEmpty ? (
        <Text size={size} c="dimmed">
          —
        </Text>
      ) : isText ? (
        <Text size={size} fw={500} ta="right" style={{ minWidth: 0 }}>
          {value}
        </Text>
      ) : (
        <Box style={{ minWidth: 0 }}>{value}</Box>
      )}
    </Group>
  );
}

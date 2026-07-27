"use client";

import { Box, Stack, Text } from "@peppermint/ui";
import type { ProfileFieldProps } from "./ProfileField.types";

/**
 * One label→value pair, the atom of every profile property list: a dimmed label
 * stacked above its value, so pairs tile cleanly into a two-column grid. Strings
 * render as `Text`; a passed node (badge, link, a status switch) renders as-is.
 * Empty values show a dimmed em-dash — a fact, never an action.
 *
 * The value sits one size step above its label. Label and value at the same
 * size gave a profile with no internal hierarchy: the caption competed with
 * the answer.
 */
export function ProfileField({
  label,
  value,
  labelSize = "xs",
  valueSize = "sm",
}: ProfileFieldProps) {
  const isEmpty = value === null || value === undefined || value === "";
  const isText = typeof value === "string" || typeof value === "number";

  return (
    <Stack gap={2}>
      <Text c="dimmed" size={labelSize}>
        {label}
      </Text>
      {isEmpty ? (
        <Text size={valueSize} c="dimmed">
          —
        </Text>
      ) : isText ? (
        <Text size={valueSize} fw={500} style={{ minWidth: 0 }}>
          {value}
        </Text>
      ) : (
        <Box style={{ minWidth: 0 }}>{value}</Box>
      )}
    </Stack>
  );
}

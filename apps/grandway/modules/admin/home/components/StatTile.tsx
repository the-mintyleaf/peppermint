"use client";

import { Group, Loader, Paper, Stack, Text, Tooltip } from "@peppermint/ui";
import type { StatTileProps } from "./StatTile.types";

/**
 * A single health-indicator number with context (label + icon), never a bare
 * count — and never a fabricated "0" when the real value is unknown. A
 * failed fetch renders "—" with a tooltip, not a zero that reads as "none."
 */
export function StatTile({
  label,
  count,
  isLoading,
  isError,
  color,
  icon,
}: StatTileProps) {
  return (
    <Paper withBorder p="sm" radius="md">
      <Group justify="space-between" align="center" wrap="nowrap">
        <Stack gap={2}>
          <Text size="xs" c="dimmed">
            {label}
          </Text>
          {isLoading ? (
            <Loader size="xs" />
          ) : isError ? (
            <Tooltip label="Couldn't load this count">
              <Text
                size="xl"
                fw={700}
                c="dimmed"
                tabIndex={0}
                aria-label={`${label}: couldn't load this count`}
              >
                —
              </Text>
            </Tooltip>
          ) : (
            <Text size="xl" fw={700} c={color}>
              {count}
            </Text>
          )}
        </Stack>
        {icon}
      </Group>
    </Paper>
  );
}

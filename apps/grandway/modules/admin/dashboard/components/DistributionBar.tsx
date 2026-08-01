"use client";

import { Box, Group, Progress, Stack, Text } from "@peppermint/ui";
import type { DistributionBarProps } from "./DistributionBar.types";

/**
 * One stacked distribution bar with a heading, its total, and a word+colour+value
 * legend. Deliberately a `Progress` and not a chart: these sets are small and
 * heterogeneous, and a real chart's axes and ticks would cost more room than the
 * distribution itself is worth. A zero segment keeps its legend entry, greyed —
 * a status that empties must not silently vanish from the key.
 */
export function DistributionBar({ heading, data }: DistributionBarProps) {
  const total = data.reduce((sum, datum) => sum + datum.value, 0);

  return (
    <Stack gap="xs">
      <Text
        size="xs"
        fw={600}
        c="dimmed"
        tt="uppercase"
        style={{ letterSpacing: "0.06em" }}
      >
        {heading} · {total}
      </Text>
      <Progress.Root size="lg" radius="sm">
        {data.map((datum) => (
          <Progress.Section
            key={datum.key}
            value={total > 0 ? (datum.value / total) * 100 : 0}
            color={datum.color}
            title={`${datum.label}: ${datum.value}`}
            aria-label={`${datum.label}: ${datum.value}`}
          />
        ))}
      </Progress.Root>
      <Group gap="md" wrap="wrap">
        {data.map((datum) => (
          <Group key={datum.key} gap={6} wrap="nowrap">
            <Box
              aria-hidden
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background:
                  datum.value === 0
                    ? "var(--mantine-color-gray-3)"
                    : `var(--mantine-color-${datum.color}-6)`,
              }}
            />
            <Text size="xs" c={datum.value === 0 ? "dimmed" : undefined}>
              {datum.label} {datum.value}
            </Text>
          </Group>
        ))}
      </Group>
    </Stack>
  );
}

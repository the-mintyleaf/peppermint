"use client";

import { Box, Group, Stack, Text } from "@peppermint/ui";
import { chartColor } from "../dashboard.utils";
import type { ColumnChartProps } from "./ColumnChart.types";

/**
 * A compact vertical bar chart for a small, fixed set of buckets (journeys by
 * stage, checklists by status, offer decisions). Heights scale against the
 * largest value; a zero bucket keeps a 2px stub and a dimmed value so the key is
 * still visibly present (the counts are zero-filled — every key always shows).
 * Value sits above each column and the word label below, so a bar is never read
 * by color alone.
 */
export function ColumnChart({ items, height = 120 }: ColumnChartProps) {
  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <Group gap="sm" align="stretch" grow wrap="nowrap">
      {items.map((item) => {
        const isZero = item.value === 0;
        const barHeight = isZero
          ? 2
          : Math.max(4, Math.round((item.value / max) * height));
        return (
          <Stack key={item.label} gap={6} align="center" justify="flex-end">
            <Text size="xs" ff="monospace" c={isZero ? "dimmed" : undefined}>
              {item.value}
            </Text>
            <Box
              style={{
                width: "100%",
                height: barHeight,
                borderRadius: "var(--mantine-radius-sm)",
                background: isZero
                  ? "var(--mantine-color-gray-2)"
                  : chartColor(item.color ?? "gray"),
              }}
            />
            <Text fz={10} c="dimmed" ta="center" lineClamp={1}>
              {item.label}
            </Text>
          </Stack>
        );
      })}
    </Group>
  );
}

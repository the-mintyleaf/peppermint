"use client";

import { Box, Group, Stack, Text } from "@peppermint/ui";
import { DonutChart } from "@peppermint/ui/charts";
import { CHART_TRACK_COLOR, toChartColor } from "../dashboard.chartConfig";
import type { DonutStatItem, DonutStatProps } from "./DonutStat.types";

function Legend({ items }: { items: DonutStatItem[] }) {
  return (
    <Stack gap={8} style={{ flex: 1, minWidth: 0 }}>
      {items.map((item) => (
        <Group key={item.label} gap={8} wrap="nowrap">
          <Box
            aria-hidden
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              flex: "none",
              background:
                item.value === 0
                  ? "var(--mantine-color-gray-3)"
                  : `var(--mantine-color-${item.color}-6)`,
            }}
          />
          <Text
            size="xs"
            c={item.value === 0 ? "dimmed" : undefined}
            style={{ flex: 1, minWidth: 0 }}
            truncate
          >
            {item.label}
          </Text>
          <Text
            size="xs"
            ff="monospace"
            c={item.value === 0 ? "dimmed" : undefined}
          >
            {item.value}
          </Text>
        </Group>
      ))}
    </Stack>
  );
}

/**
 * A `DonutChart` split by a status breakdown (applicants/offers by status, checklists,
 * journey outcomes, offer decisions) with the total overlaid in the centre and a
 * word+color+value legend beside or below it. Slice colors come from the owning
 * module's status map, so a slice means the same thing here as on that module's list.
 * When every value is 0 the ring shows a neutral gray track (tooltip suppressed) and
 * the centre reads its total — a real, healthy state, not an error.
 */
export function DonutStat({
  items,
  centerValue,
  centerLabel,
  size = 132,
  thickness = 12,
  layout = "vertical",
}: DonutStatProps) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const data =
    total > 0
      ? items
          .filter((item) => item.value > 0)
          .map((item) => ({
            name: item.label,
            value: item.value,
            color: toChartColor(item.color),
          }))
      : [{ name: "None", value: 1, color: CHART_TRACK_COLOR }];

  const ring = (
    <Box style={{ position: "relative", width: size, height: size }}>
      <DonutChart
        data={data}
        size={size}
        thickness={thickness}
        withTooltip={total > 0}
        tooltipDataSource="segment"
        paddingAngle={total > 0 && data.length > 1 ? 2 : 0}
        strokeWidth={0}
      />
      <Stack
        gap={0}
        align="center"
        justify="center"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <Text size="lg" fw={700} lh={1}>
          {centerValue}
        </Text>
        <Text size="xs" c="dimmed">
          {centerLabel}
        </Text>
      </Stack>
    </Box>
  );

  if (layout === "horizontal") {
    return (
      <Group gap="lg" wrap="nowrap" align="center">
        <Box style={{ flex: "none" }}>{ring}</Box>
        <Legend items={items} />
      </Group>
    );
  }

  return (
    <Stack gap="md" align="center">
      {ring}
      <Box style={{ width: "100%" }}>
        <Legend items={items} />
      </Box>
    </Stack>
  );
}

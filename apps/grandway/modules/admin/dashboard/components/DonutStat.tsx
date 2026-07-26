"use client";

import { Box, Group, RingProgress, Stack, Text } from "@peppermint/ui";
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
 * A ring split by a status breakdown (applicants by status, offers by status,
 * journey outcomes) with the total in the centre and a word+color+value legend
 * beside or below it. Colors come from the owning module's status map so a slice
 * means the same thing here as on that module's own list. When every value is 0
 * the ring shows an empty gray track and the centre reads "0" — a real, healthy
 * state, not an error.
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
  const sections =
    total > 0
      ? items
          .filter((item) => item.value > 0)
          .map((item) => ({
            value: (item.value / total) * 100,
            color: item.color,
            tooltip: `${item.label}: ${item.value}`,
          }))
      : [];

  const ring = (
    <RingProgress
      size={size}
      thickness={thickness}
      roundCaps={false}
      sections={sections}
      rootColor="gray.1"
      label={
        <Stack gap={0} align="center">
          <Text size="lg" fw={700} lh={1}>
            {centerValue}
          </Text>
          <Text size="xs" c="dimmed">
            {centerLabel}
          </Text>
        </Stack>
      }
    />
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

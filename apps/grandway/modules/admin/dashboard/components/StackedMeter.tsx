"use client";

import { Box, Group, Progress, Text } from "@peppermint/ui";
import type { StackedMeterProps } from "./StackedMeter.types";

/**
 * A single row whose bar is split into meaning-carrying segments (converted /
 * in-progress / lost, or open / overdue / blocked). All segments scale against a
 * shared `max` so rows compare honestly. Colors come from the owning module's
 * status map; the section renders the shared legend so the dots aren't repeated
 * per row. Each segment carries a `title` so its meaning is available on hover
 * and to assistive tech, never color alone.
 */
export function StackedMeter({
  label,
  segments,
  max,
  labelWidth = 110,
  trailing,
}: StackedMeterProps) {
  return (
    <Group gap="sm" wrap="nowrap" align="center">
      <Text size="xs" style={{ width: labelWidth, flex: "none" }} truncate>
        {label}
      </Text>
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Progress.Root size="lg" radius="sm">
          {segments.map((seg, i) => (
            <Progress.Section
              // Segment identity is (label + index) — labels are unique per row.
              key={`${seg.label}-${i}`}
              value={max > 0 ? (seg.value / max) * 100 : 0}
              color={seg.color}
              title={`${seg.label}: ${seg.value}`}
              aria-label={`${seg.label}: ${seg.value}`}
            />
          ))}
        </Progress.Root>
      </Box>
      {trailing ? <Box style={{ flex: "none" }}>{trailing}</Box> : null}
    </Group>
  );
}

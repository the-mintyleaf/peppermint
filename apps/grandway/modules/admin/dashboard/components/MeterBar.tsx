"use client";

import Link from "next/link";
import { Anchor, Box, Group, Progress, Text } from "@peppermint/ui";
import type { MeterBarProps } from "./MeterBar.types";

/**
 * One labelled horizontal bar: `label · track+fill · value`. The flat
 * signal-board unit reused by the alert strip, "Leads by stage", "Closed &
 * archived" and the workload/source rows. Width is `value / max` so a group of
 * bars is comparable at a glance; color carries meaning (a status color from the
 * owning module, or a neutral gray for a pure quantity) — brand is reserved for
 * the one `emphasize` row per group.
 */
export function MeterBar({
  label,
  value,
  max,
  color = "gray",
  emphasize = false,
  display,
  labelWidth = 110,
  muted = false,
  href,
}: MeterBarProps) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const fillColor = emphasize ? "brand" : color;

  const row = (
    <Group gap="sm" wrap="nowrap" align="center">
      <Text
        size="xs"
        c={muted ? "dimmed" : undefined}
        style={{ width: labelWidth, flex: "none" }}
        truncate
      >
        {label}
      </Text>
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Progress
          value={pct}
          color={muted ? "gray" : fillColor}
          size="md"
          radius="sm"
          aria-label={typeof label === "string" ? label : undefined}
        />
      </Box>
      <Text
        size="xs"
        fw={600}
        ta="right"
        c={muted ? "dimmed" : undefined}
        ff="monospace"
        style={{ width: 40, flex: "none" }}
      >
        {display ?? value}
      </Text>
    </Group>
  );

  if (href) {
    return (
      <Anchor component={Link} href={href} underline="never" c="inherit">
        {row}
      </Anchor>
    );
  }
  return row;
}

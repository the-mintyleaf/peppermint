"use client";

import { Box, Stack, Text } from "@peppermint/ui";
import { DonutChart } from "@peppermint/ui/charts";
import { CHART_TRACK_COLOR } from "../dashboard.chartConfig";
import { formatRatePercent } from "../dashboard.utils";
import type { GaugeProps } from "./Gauge.types";

const SIZE = 128;
const THICKNESS = 11;

/**
 * A half-circle gauge for one conversion rate, drawn as a semicircle `DonutChart`
 * (`startAngle=180`, `endAngle=0`). The rate anchors its cell, so the filled arc uses
 * the brand accent; a null percent (the denominator was 0) shows an empty track and
 * "—", never a misleading 0%. The number is the signal — the arc is a secondary,
 * at-a-glance cue.
 */
export function Gauge({ percent, label, caption }: GaugeProps) {
  const clamped = percent === null ? 0 : Math.max(0, Math.min(100, percent));
  const data =
    percent === null
      ? [{ name: "No data", value: 1, color: CHART_TRACK_COLOR }]
      : [
          { name: label, value: clamped, color: "brand.6" },
          { name: "remaining", value: 100 - clamped, color: CHART_TRACK_COLOR },
        ];

  return (
    <Stack gap={2} align="center">
      <Box
        role="img"
        aria-label={`${label}: ${formatRatePercent(percent)}`}
        // The semicircle occupies the top half of the DonutChart's square box; clip to
        // that half so the empty lower half doesn't add dead vertical space.
        style={{
          position: "relative",
          width: SIZE,
          height: SIZE / 2 + THICKNESS / 2,
          overflow: "hidden",
        }}
      >
        <DonutChart
          data={data}
          size={SIZE}
          thickness={THICKNESS}
          startAngle={180}
          endAngle={0}
          withTooltip={false}
          strokeWidth={0}
        />
        <Text
          fw={700}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            textAlign: "center",
          }}
        >
          {formatRatePercent(percent)}
        </Text>
      </Box>
      <Text size="xs" ta="center">
        {label}
      </Text>
      <Text size="xs" c="dimmed" ff="monospace">
        {caption}
      </Text>
    </Stack>
  );
}

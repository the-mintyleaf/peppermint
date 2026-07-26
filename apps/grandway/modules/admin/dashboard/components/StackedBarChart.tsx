"use client";

import { BarChart } from "@peppermint/ui/charts";
import { toChartColor } from "../dashboard.chartConfig";
import type { StackedBarChartProps } from "./StackedBarChart.types";

/**
 * A horizontal stacked bar per category (leads by source, per-owner checklist load).
 * Segments share a scale so rows compare honestly; the legend names each segment and
 * the tooltip carries the exact per-segment counts, so a segment is never read by
 * color alone. Colors come from the section's status meaning (converted/in-progress/
 * lost, open/overdue/blocked).
 */
export function StackedBarChart({
  data,
  indexKey,
  series,
  h,
  ariaLabel,
}: StackedBarChartProps) {
  const height = h ?? Math.max(140, data.length * 40 + 40);

  return (
    <BarChart
      h={height}
      data={data}
      dataKey={indexKey}
      type="stacked"
      // Mantine "vertical" orientation = horizontal bars (category on the y-axis).
      orientation="vertical"
      series={series.map((s) => ({
        name: s.name,
        label: s.label,
        color: toChartColor(s.color),
      }))}
      withLegend
      legendProps={{ verticalAlign: "top", height: 32 }}
      withTooltip
      gridAxis="none"
      tickLine="none"
      withXAxis={false}
      withYAxis
      yAxisProps={{ width: 132 }}
      barProps={{ radius: 2 }}
      // `role="img"` so the aria-label names the chart — Mantine forwards these to the
      // root `<div>`, whose default `generic` role would otherwise drop the label.
      role="img"
      aria-label={ariaLabel}
    />
  );
}

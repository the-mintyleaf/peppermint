"use client";

import { BarChart } from "@peppermint/ui/charts";
import { CHART_ZERO_COLOR, toChartColor } from "../dashboard.chartConfig";
import type { CategoryBarChartProps } from "./CategoryBarChart.types";

/**
 * A single-measure magnitude chart for a small fixed set (leads/journeys by stage,
 * per-owner workload counts). One hue for every bar with the value printed on it, so
 * the bar is read by length + number, never by color. A zero-valued bar drops to a
 * muted gray so the key stays visibly present (counts are zero-filled — every key
 * always shows). `orientation="horizontal"` puts categories on the y-axis, which reads
 * better for long labels (owner names, stage names).
 */
export function CategoryBarChart({
  items,
  color,
  orientation = "vertical",
  h,
  ariaLabel,
}: CategoryBarChartProps) {
  const bars = orientation === "horizontal";
  const height = h ?? (bars ? Math.max(120, items.length * 34) : 168);
  const seriesColor = toChartColor(color);

  return (
    <BarChart
      h={height}
      data={items.map((item) => ({ label: item.label, value: item.value }))}
      dataKey="label"
      series={[{ name: "value", label: "Count", color: seriesColor }]}
      // Mantine's `orientation="vertical"` renders *horizontal* bars (category on the
      // y-axis); the default "horizontal" renders columns.
      orientation={bars ? "vertical" : "horizontal"}
      withLegend={false}
      withTooltip={false}
      withBarValueLabel
      gridAxis="none"
      tickLine="none"
      withXAxis={!bars}
      withYAxis={bars}
      yAxisProps={bars ? { width: 132 } : undefined}
      getBarColor={(value) => (value === 0 ? CHART_ZERO_COLOR : seriesColor)}
      barProps={{ radius: 4, maxBarSize: 46 }}
      aria-label={ariaLabel}
    />
  );
}

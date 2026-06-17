"use client";

import { LineChart } from "@peppermint/ui";
import type { ContentVolumeSeries } from "../../Analytics.types";

interface ContentVolumeChartProps {
  series: ContentVolumeSeries[];
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "violet.6",
  twitter: "blue.6",
  linkedin: "indigo.6",
  tiktok: "red.6",
};

// Distinct dash patterns per platform — solid/dashed/dotted for accessibility
const PLATFORM_STROKE_DASH: Record<string, string | undefined> = {
  instagram: undefined,
  twitter: "5 3",
  linkedin: "2 2",
  tiktok: "8 3 2 3",
};

export function ContentVolumeChart({ series }: ContentVolumeChartProps) {
  const platforms = [...new Set(series.map((s) => s.platform))];

  // Pivot: { date, instagram: N, twitter: N, ... }
  const dateMap = new Map<string, Record<string, number>>();
  for (const point of series) {
    if (!dateMap.has(point.date)) dateMap.set(point.date, { date: point.date } as unknown as Record<string, number>);
    dateMap.get(point.date)![point.platform] = point.count;
  }
  const data = [...dateMap.values()].sort((a, b) =>
    String(a.date) < String(b.date) ? -1 : 1
  );

  const chartSeries = platforms.map((p) => ({
    name: p,
    color: PLATFORM_COLORS[p] ?? "gray.6",
    strokeDasharray: PLATFORM_STROKE_DASH[p],
  }));

  return (
    <LineChart
      h={260}
      data={data}
      dataKey="date"
      series={chartSeries}
      curveType="monotone"
      withLegend
      withTooltip
      withDots={false}
      tickLine="xy"
      gridAxis="xy"
    />
  );
}

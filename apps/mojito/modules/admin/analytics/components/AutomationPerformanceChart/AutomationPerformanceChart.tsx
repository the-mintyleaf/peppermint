"use client";

import { BarChart } from "@peppermint/ui";
import type { AutomationStatRow } from "../../Analytics.types";

interface AutomationPerformanceChartProps {
  rows: AutomationStatRow[];
}

export function AutomationPerformanceChart({ rows }: AutomationPerformanceChartProps) {
  const top10 = [...rows].sort((a, b) => b.runs - a.runs).slice(0, 10);

  const data = top10.map((row) => ({
    name: row.name,
    runs: row.runs,
    color: row.successRate >= 90 ? "green.6" : row.successRate >= 70 ? "yellow.6" : "red.6",
  }));

  return (
    <BarChart
      h={260}
      data={data}
      dataKey="name"
      orientation="vertical"
      series={[{ name: "runs", label: "Runs", color: "blue.6" }]}
      withTooltip
      withLegend={false}
      tickLine="none"
      gridAxis="x"
    />
  );
}

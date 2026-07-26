export interface StackedBarChartSeries {
  /** Key read from each data row. */
  name: string;
  /** Legend/tooltip label for the segment. */
  label: string;
  /** Mantine color name or hex. */
  color: string;
}

export interface StackedBarChartProps {
  /** One row per category; each row holds `[indexKey]` plus a value under every series `name`. */
  data: Record<string, string | number>[];
  /** Key on each row that holds the category label (y-axis). */
  indexKey: string;
  /** Ordered segments, drawn left→right and listed in the legend. */
  series: StackedBarChartSeries[];
  /** Plot height in px. Defaults to a value derived from the row count. */
  h?: number;
  /** Accessible summary of what the chart shows. */
  ariaLabel: string;
}

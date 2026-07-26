export interface ColumnChartItem {
  /** Short axis label under the column. */
  label: string;
  value: number;
  /** Mantine color name or hex. Defaults to a neutral gray. */
  color?: string;
}

export interface ColumnChartProps {
  items: ColumnChartItem[];
  /** Plot area height in px (excludes value/label rows). */
  height?: number;
}

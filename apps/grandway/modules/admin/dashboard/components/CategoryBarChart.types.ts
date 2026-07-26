export interface CategoryBarChartItem {
  /** Axis label for the bar/column. */
  label: string;
  value: number;
}

export interface CategoryBarChartProps {
  items: CategoryBarChartItem[];
  /** Mantine color name/hex for every bar (a magnitude chart is single-hue; the
   *  value printed on each bar carries the meaning, not the color). */
  color: string;
  /** `"vertical"` = columns (category on the x-axis); `"horizontal"` = bars
   *  (category on the y-axis, better for long labels). @default "vertical" */
  orientation?: "vertical" | "horizontal";
  /** Plot height in px. Defaults to a sensible value derived from orientation/count. */
  h?: number;
  /** Accessible summary of what the chart shows. */
  ariaLabel: string;
}

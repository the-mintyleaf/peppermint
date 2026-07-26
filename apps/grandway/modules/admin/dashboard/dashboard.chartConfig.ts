/**
 * Shared helpers for the dashboard's Mantine Charts (`@peppermint/ui/charts`).
 *
 * Chart grammar for the whole page: a **breakdown** of a total into named parts is a
 * `DonutChart` (per-slice status color); a **magnitude** comparison is a `BarChart`
 * (single hue, value printed on the bar so it never reads by color alone); a **rate**
 * is a semicircle gauge; and a few navigational **meters** stay as `Progress`. Colors
 * still come from each owning module's status map so a slice means the same thing here
 * as on that module's list.
 */

/** Neutral track used for an empty ring / a zero-height bar. */
export const CHART_TRACK_COLOR = "gray.2";

/** Color for a zero-valued bar — present but muted, never mistaken for signal. */
export const CHART_ZERO_COLOR = "gray.3";

/**
 * Normalize a status-map color into a value Mantine Charts accepts. The maps this
 * module consumes are Mantine color *names* (`"blue"`, `"green"`, `"gray"`); charts
 * want an indexed shade (`"blue.6"`) so a slice matches its legend dot. A raw hex or
 * an already-indexed name (`"gray.2"`) passes through untouched.
 */
export function toChartColor(name: string, shade = 6): string {
  if (name.startsWith("#") || name.includes(".")) return name;
  return `${name}.${shade}`;
}

import { dayjs } from "@peppermint/ui";
import type { BsDate } from "./dashboard.types";

/** ISO datetime -> readable local string, `—` when null. */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return dayjs(value).format("MMM D, YYYY h:mm A");
}

/** `YYYY-MM-DD`/ISO date + its BS sibling's `display`, `—` when null. Never recomputes BS. */
export function formatDate(
  value: string | null | undefined,
  bs?: BsDate | null,
): string {
  if (!value) return "—";
  const formatted = dayjs(value).format("MMM D, YYYY");
  return bs?.display ? `${formatted} (${bs.display})` : formatted;
}

/** `Rate.percent` renders as "—" (never "0%") when the denominator was 0. */
export function formatRatePercent(percent: number | null): string {
  return percent === null ? "—" : `${percent}%`;
}

/**
 * A Mantine color name (`"blue"`, `"brand"`, `"gray"`, …) or a raw hex is turned
 * into a CSS color usable in a custom bar/SVG fill. The status→color maps this
 * module imports from the owning apps are all Mantine names, so this keeps their
 * meaning while letting the flat chart primitives paint plain `<div>`/`<svg>`
 * fills. RingProgress/Progress accept the name directly, so they don't need this.
 */
export function chartColor(name: string, shade = 6): string {
  return name.startsWith("#") ? name : `var(--mantine-color-${name}-${shade})`;
}

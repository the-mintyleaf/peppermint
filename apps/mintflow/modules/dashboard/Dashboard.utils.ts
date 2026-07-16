import { tokens } from "@/config/design";

/** Recurring white-alpha foregrounds/surfaces over the dark reporting tiles. */
export const dark = {
  tile: tokens.tile,
  white: "#fff",
  text: "rgba(255,255,255,0.92)",
  muted: "rgba(255,255,255,0.55)",
  faint: "rgba(255,255,255,0.35)",
  label: "rgba(255,255,255,0.5)",
  toggleBg: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.08)",
  barIdleMobile: "rgba(255,255,255,0.25)",
  barIdleDesktop: "rgba(255,255,255,0.22)",
} as const;

/**
 * Peak-bar coloring: the tallest bar is accent; the rest are muted white.
 * The idle shade differs slightly between the mobile and desktop surfaces.
 */
export function barColor(
  isPeak: boolean,
  variant: "mobile" | "desktop",
): string {
  if (isPeak) return tokens.accent;
  return variant === "mobile" ? dark.barIdleMobile : dark.barIdleDesktop;
}

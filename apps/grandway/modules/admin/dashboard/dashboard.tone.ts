// The dashboard's colour is DERIVED, never decided at the call site. A figure's
// tone is a function of the figure — a zero alert is a good outcome and turns
// calm; a breached SLA turns red the moment it is non-zero — so a wall of tiles
// re-colours itself as the day moves without anyone editing a colour prop.
//
// Colour is never the only carrier (DESIGN.md §1.9 / Layer 4): every toned
// element also renders a word, and the tone only ever reinforces it.

export type FigureTone =
  /** A standing total with no health reading — never an alert. */
  | "neutral"
  /** An alert band that is currently at zero: the state you are glad to see. */
  | "good"
  /** Outstanding work with no clock on it. */
  | "info"
  /** Aging, or at risk of breaching. */
  | "warning"
  /** An SLA already breached. */
  | "critical";

/** Mantine colour name per tone — the single place a dashboard hue is chosen. */
export const TONE_COLOR: Record<FigureTone, string> = {
  neutral: "gray",
  good: "teal",
  info: "violet",
  warning: "orange",
  critical: "red",
};

/** The word that rides alongside the colour, so meaning survives without it. */
export const TONE_WORD: Record<FigureTone, string> = {
  neutral: "",
  good: "Clear",
  info: "Queued",
  warning: "At risk",
  critical: "Breached",
};

/**
 * The severity a figure carries **when it is non-zero**. At zero every alert
 * band reads `good`, which is why the band is declared once per figure and the
 * tone is computed per render rather than hardcoded.
 */
export type AlertBand = Extract<FigureTone, "info" | "warning" | "critical">;

/**
 * Tone for an alert figure. `undefined` (loading, or a failed fetch) stays
 * `neutral` — "we could not ask" must never render as "all clear".
 */
export function toneForAlert(
  value: number | undefined,
  band: AlertBand,
): FigureTone {
  if (value === undefined) return "neutral";
  return value > 0 ? band : "good";
}

/**
 * Tone for a figure read against thresholds rather than a fixed band — used by
 * the lead categories, where "12 needing attention" is only alarming relative to
 * how many leads there are. Shares are 0–1.
 */
export function toneForShare(
  value: number | undefined,
  total: number | undefined,
  { warnAbove = 0.1, criticalAbove = 0.25 } = {},
): FigureTone {
  if (value === undefined || !total) return "neutral";
  if (value === 0) return "good";
  const share = value / total;
  if (share > criticalAbove) return "critical";
  if (share > warnAbove) return "warning";
  return "info";
}

/** `var(--mantine-color-<hue>-light)` etc., so a tone resolves in both schemes. */
export function toneVar(
  tone: FigureTone,
  variant: "light" | "light-color" | "filled" | "6",
): string {
  return `var(--mantine-color-${TONE_COLOR[tone]}-${variant})`;
}

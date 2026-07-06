import type { MantineSize } from "@peppermint/ui";

export interface BilingualNameProps {
  /** Devanagari (Nepali) name — canonical primary label. */
  np: string;
  /** English name — shown as a muted secondary line when present. */
  en?: string;
  /** Font size of the primary (np) line. Default `"sm"`. */
  size?: MantineSize;
  /** Font weight of the primary (np) line. Default `500`. */
  fw?: number;
  /** Color of the primary (np) line. Passed through to the primary text. */
  c?: string;
  /**
   * Render both names on one line (`np · en`) instead of stacked — for tight
   * cells. Default `false` (stacked).
   */
  inline?: boolean;
}

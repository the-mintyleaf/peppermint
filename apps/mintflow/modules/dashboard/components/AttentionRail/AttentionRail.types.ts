import type { AttentionItem } from "../../module.api";

export interface AttentionRailProps {
  /** Compact exceptions only — never a re-list of all work (spec §8). */
  items: AttentionItem[];
  /** The single next-action lever per item. */
  onAction: (item: AttentionItem) => void;
}

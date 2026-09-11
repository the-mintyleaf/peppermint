import type { Signatory } from "../../signatures.types";

export interface SignatureImageProps {
  signatory: Signatory | null | undefined;
  /** Rendered height in px. The width is always `fit="contain"` inside it. */
  height?: number;
  /**
   * Shown when there is nothing to render. Defaults to a muted "No signature
   * image" line — a management list wants to say so plainly, while a compact
   * row may prefer to pass `null` and stay quiet.
   */
  emptyLabel?: string | null;
}

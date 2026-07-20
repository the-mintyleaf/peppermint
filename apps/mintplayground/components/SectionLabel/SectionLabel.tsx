"use client";

import { MonoText } from "../MonoText";
import type { SectionLabelProps } from "./SectionLabel.types";

/**
 * Uppercase, tracked, muted mono label that heads a section
 * (e.g. "FOCUS NOW", "DESCRIPTION", "STATUS MIX").
 */
export function SectionLabel({
  fz = "10px",
  fw = 600,
  // Tokenised, not a fixed black alpha: the label has to stay legible when the
  // surface inverts, and `dimmed` is under AA at this size.
  c = "var(--ml-meta-ink)",
  ...props
}: SectionLabelProps) {
  return <MonoText label fz={fz} fw={fw} c={c} {...props} />;
}

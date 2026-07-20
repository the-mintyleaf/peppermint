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
  c = "rgba(0,0,0,0.42)",
  ...props
}: SectionLabelProps) {
  return <MonoText label fz={fz} fw={fw} c={c} {...props} />;
}

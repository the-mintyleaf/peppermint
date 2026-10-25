// ─── Woda Template Text Props ───────────────────────────────────────────────
// Reusable text styling props for WODA templates

export const wodaTextProps = {
  size: "15.4px",
  lh: ".2in",
  color: "black",
} as const;

export const wodaTitleProps = {
  size: "18px",
  weight: 600,
  lh: ".25in",
  color: "black",
} as const;

/** A justified body paragraph — the running text of every letter. */
export const wodaParagraphProps = {
  ...wodaTextProps,
  lh: ".27in",
  style: { textAlign: "justify" },
} as const;

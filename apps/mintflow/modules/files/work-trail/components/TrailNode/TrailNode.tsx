"use client";

import { Box } from "@peppermint/ui";

import type { TrailNodeProps } from "../../WorkTrail.types";

/**
 * The 24px circular node anchoring each timeline stage. Purely presentational —
 * the caller supplies the fill/border/shadow and an optional centered glyph.
 */
export function TrailNode({
  background = "transparent",
  border,
  boxShadow,
  children,
}: TrailNodeProps) {
  return (
    <Box
      style={{
        width: 24,
        height: 24,
        flex: "0 0 auto",
        borderRadius: "50%",
        background,
        border,
        boxShadow,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        zIndex: 1,
      }}
    >
      {children}
    </Box>
  );
}

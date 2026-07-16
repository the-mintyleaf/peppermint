"use client";

import { Box } from "@peppermint/ui";

import type { AvatarProps } from "../../WorkTrail.types";

/** A colored circle with white initials — the trail's compact person avatar. */
export function Avatar({ initials, color, size = 20 }: AvatarProps) {
  return (
    <Box
      aria-hidden
      style={{
        width: size,
        height: size,
        flex: "0 0 auto",
        borderRadius: "50%",
        background: color,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        fontSize: Math.round(size * 0.42),
        fontWeight: 600,
        letterSpacing: "0.02em",
        lineHeight: 1,
      }}
    >
      {initials}
    </Box>
  );
}

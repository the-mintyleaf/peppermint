"use client";

import { Box, Group } from "@peppermint/ui";

import type { StatusPillProps } from "./StatusPill.types";

/**
 * Small status / category chip. Encodes status as words + color + a leading dot
 * (never color alone). Purely a fact badge — visually distinct from buttons.
 */
export function StatusPill({
  children,
  fg = "rgba(0,0,0,0.6)",
  bg = "rgba(0,0,0,0.06)",
  border,
  dot = false,
  mono = false,
  fz = "10px",
  radius = 7,
  px = 9,
  py = 4,
}: StatusPillProps) {
  const dotColor = typeof dot === "string" ? dot : fg;
  return (
    <Group
      component="span"
      gap={7}
      wrap="nowrap"
      display="inline-flex"
      style={{
        alignItems: "center",
        color: fg,
        background: bg,
        border: border ? `1px solid ${border}` : undefined,
        borderRadius: radius,
        padding: `${py}px ${px}px`,
        fontSize: fz,
        fontWeight: 600,
        fontFamily: mono
          ? '"JetBrains Mono", ui-monospace, monospace'
          : undefined,
        letterSpacing: mono ? "0.04em" : "0.3px",
        textTransform: mono ? "uppercase" : undefined,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {dot ? (
        <Box
          component="span"
          w={7}
          h={7}
          style={{
            borderRadius: "50%",
            background: dotColor,
            flex: "0 0 auto",
          }}
        />
      ) : null}
      {children}
    </Group>
  );
}

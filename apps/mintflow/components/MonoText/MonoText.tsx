"use client";

import { Text } from "@peppermint/ui";

import type { MonoTextProps } from "./MonoText.types";

/**
 * JetBrains Mono text — used for every number, timestamp, and meta label in the
 * Kamban surface. Pass `label` for the uppercase tracked section-label variant.
 */
export function MonoText({ label, style, ...props }: MonoTextProps) {
  return (
    <Text
      ff="monospace"
      style={{
        letterSpacing: label ? "0.08em" : undefined,
        textTransform: label ? "uppercase" : undefined,
        ...style,
      }}
      {...props}
    />
  );
}

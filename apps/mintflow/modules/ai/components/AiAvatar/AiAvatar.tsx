"use client";

import { SparkleIcon } from "@phosphor-icons/react/dist/csr/Sparkle";
import { Box } from "@peppermint/ui";

import { tokens } from "@/config/design";

import type { AiAvatarProps } from "./AiAvatar.types";

/** The ink Kamban-AI avatar square with a white sparkle mark. */
export function AiAvatar({ size = 36, radius = 11, iconSize }: AiAvatarProps) {
  return (
    <Box
      aria-hidden
      style={{
        flex: "0 0 auto",
        width: size,
        height: size,
        borderRadius: radius,
        background: tokens.ink,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <SparkleIcon
        size={iconSize ?? Math.round(size * 0.55)}
        color="#fff"
        weight="fill"
      />
    </Box>
  );
}

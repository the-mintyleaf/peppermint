"use client";

import { Box, Text } from "@peppermint/ui";

import { tokens } from "@/config/design";
import type { FocusStatProps } from "./FocusStat.types";

/** One big-number cell in the focus hero's readout row (spec §5 / §10). */
export function FocusStat({
  value,
  label,
  color = tokens.ink,
}: FocusStatProps) {
  return (
    <Box>
      <Text
        ff="monospace"
        fw={700}
        c={color}
        style={{ fontSize: 34, lineHeight: 1, letterSpacing: "-0.5px" }}
      >
        {value}
      </Text>
      <Text fz="11.5px" fw={500} c="rgba(0,0,0,0.5)" mt={6}>
        {label}
      </Text>
    </Box>
  );
}

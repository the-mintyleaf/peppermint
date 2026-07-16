"use client";

import { Box, Group, Stack } from "@peppermint/ui";

import { tokens } from "@/config/design";
import { MonoText } from "@/components";

import type { StatusMixProps } from "./StatusMix.types";

const SEGMENTS = [
  { label: "Ongoing", color: tokens.blue },
  { label: "On-Next", color: tokens.accent },
  { label: "Done", color: tokens.green },
] as const;

/** Light tile: a single segmented bar of the status split + a 3-column legend. */
export function StatusMix({ total, mix, legend, style }: StatusMixProps) {
  return (
    <Stack
      gap={0}
      p={20}
      style={{
        background: tokens.paper2,
        borderRadius: 24,
        minWidth: 0,
        ...style,
      }}
    >
      <Group justify="space-between" align="center" wrap="nowrap">
        <MonoText label fz={10} c={tokens.muted2}>
          STATUS MIX
        </MonoText>
        <MonoText fz={11} fw={500} c={tokens.muted}>
          {total} total
        </MonoText>
      </Group>

      <Group
        gap={0}
        wrap="nowrap"
        mt={16}
        style={{ height: 12, borderRadius: 6, overflow: "hidden" }}
      >
        {SEGMENTS.map((segment, i) => (
          <Box
            key={segment.label}
            style={{ width: `${mix[i] * 100}%`, background: segment.color }}
          />
        ))}
      </Group>

      <Group grow gap={12} mt={16} align="flex-start" wrap="nowrap">
        {SEGMENTS.map((segment, i) => (
          <Stack key={segment.label} gap={6} style={{ minWidth: 0 }}>
            <Group gap={6} align="center" wrap="nowrap">
              <Box
                w={7}
                h={7}
                style={{ borderRadius: "50%", background: segment.color }}
              />
              <MonoText fz={10} fw={500} c={tokens.muted2}>
                {segment.label}
              </MonoText>
            </Group>
            <MonoText
              fz={22}
              fw={700}
              c={tokens.ink}
              style={{ letterSpacing: "-1px" }}
            >
              {legend[i]}
            </MonoText>
          </Stack>
        ))}
      </Group>
    </Stack>
  );
}

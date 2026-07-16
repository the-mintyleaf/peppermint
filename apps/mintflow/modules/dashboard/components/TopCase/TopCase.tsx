"use client";

import { Box, Group, Stack, Text } from "@peppermint/ui";

import { tokens } from "@/config/design";
import { CaseIcon, MonoText } from "@/components";

import { dark } from "../../Dashboard.utils";
import type { TopCaseProps } from "./TopCase.types";

const PROGRESS = 78;

/** Dark tile: the highest-priority active case with a completion progress bar. */
export function TopCase({ variant, style }: TopCaseProps) {
  const isDesktop = variant === "desktop";

  return (
    <Stack
      gap={0}
      p={18}
      style={{ background: dark.tile, borderRadius: 20, minWidth: 0, ...style }}
    >
      <Group gap={14} align="center" wrap="nowrap">
        <CaseIcon
          kind="case"
          size={40}
          color={tokens.accent}
          tint="rgba(238,87,41,0.14)"
        />
        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
          <Text fz={15} fw={600} c={dark.white} style={{ lineHeight: 1.25 }}>
            Media Propaganda case
          </Text>
          <MonoText fz={11} fw={500} c={dark.muted}>
            14 of 18 tasks · due Fri
          </MonoText>
        </Stack>
        {!isDesktop && (
          <MonoText fz={16} fw={700} c={tokens.accent}>
            {PROGRESS}%
          </MonoText>
        )}
      </Group>

      {isDesktop && (
        <Group justify="space-between" align="center" wrap="nowrap" mt={18}>
          <MonoText label fz={10} c={dark.label}>
            Progress
          </MonoText>
          <MonoText fz={12} fw={700} c={tokens.accent}>
            {PROGRESS}%
          </MonoText>
        </Group>
      )}

      <Box
        mt={isDesktop ? 10 : 16}
        style={{
          height: 6,
          borderRadius: 3,
          background: "rgba(255,255,255,0.1)",
          overflow: "hidden",
        }}
      >
        <Box
          style={{
            width: `${PROGRESS}%`,
            height: "100%",
            background: tokens.accent,
          }}
        />
      </Box>
    </Stack>
  );
}

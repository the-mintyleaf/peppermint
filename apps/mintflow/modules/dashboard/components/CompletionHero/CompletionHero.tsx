"use client";

import { Box, Group, Stack, Text } from "@peppermint/ui";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";

import { tokens } from "@/config/design";
import { MonoText } from "@/components";

import type { CompletionHeroProps } from "./CompletionHero.types";

/**
 * Light "completion rate" hero: big mono rate, an accent progress track, and a
 * resolved-tasks footer with the period trend.
 */
export function CompletionHero({
  completion,
  ring,
  trend,
  numberSize = 46,
  style,
}: CompletionHeroProps) {
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
          COMPLETION
        </MonoText>
        <Box
          w={30}
          h={30}
          style={{
            borderRadius: "50%",
            background: tokens.ink,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckIcon size={16} color="#fff" weight="bold" aria-hidden="true" />
        </Box>
      </Group>

      <Group gap={6} align="baseline" wrap="nowrap" mt={18}>
        <MonoText
          fz={numberSize}
          fw={700}
          c={tokens.ink}
          lh={1}
          style={{ letterSpacing: "-2px" }}
        >
          {completion}
        </MonoText>
        <MonoText label fz={11} c={tokens.muted2}>
          RATE
        </MonoText>
      </Group>

      <Box
        mt={18}
        style={{
          height: 12,
          borderRadius: 6,
          background: "rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        <Box
          style={{
            width: `${ring * 100}%`,
            height: "100%",
            background: tokens.accent,
          }}
        />
      </Box>

      <Box mt={16} pt={14} style={{ borderTop: `1px solid ${tokens.line}` }}>
        <Group justify="space-between" align="center" wrap="nowrap">
          <Text fz={13} fw={600} c={tokens.ink}>
            Tasks resolved
          </Text>
          <MonoText fz={13} fw={600} c={tokens.green}>
            {trend}
          </MonoText>
        </Group>
      </Box>
    </Stack>
  );
}

"use client";

import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/csr/ArrowUpRight";
import { Box, Group, Stack, Text, UnstyledButton } from "@peppermint/ui";

import { MonoText } from "@/components";
import { tokens } from "@/config/design";

import { suggestions } from "../../AskAi.data";
import type { EmptyStateProps } from "./EmptyState.types";

/**
 * The opening state of the Ask-AI screen when the thread is empty: a greeting,
 * a capability blurb, and the tappable starter prompts.
 */
export function EmptyState({ onSend }: EmptyStateProps) {
  return (
    <Stack gap={0}>
      <Text
        fz="24px"
        fw={700}
        style={{ letterSpacing: "-0.8px", maxWidth: 290, lineHeight: 1.1 }}
      >
        Good morning, Minister.
      </Text>

      <Text
        mt={12}
        fz="14px"
        fw={500}
        c={tokens.muted}
        style={{ lineHeight: 1.5 }}
      >
        I have a full view across every department — cases, approvals awaiting
        you, risks, press exposure and staff performance.
      </Text>

      <MonoText label mt={26} fz="10px" fw={600} c={tokens.muted}>
        TRY ASKING
      </MonoText>

      <Stack gap={10} mt={12}>
        {suggestions.map((s) => {
          const Icon = s.icon;
          return (
            <UnstyledButton
              key={s.id}
              onClick={() => onSend(s.text)}
              aria-label={s.text}
              style={{
                display: "block",
                width: "100%",
                background: "#fff",
                border: `1px solid ${tokens.line}`,
                borderRadius: 14,
                padding: "14px 15px",
              }}
            >
              <Group gap={12} align="center" wrap="nowrap">
                <Box
                  aria-hidden
                  style={{
                    flex: "0 0 auto",
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: s.tint,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={16} color={s.iconColor} weight="bold" />
                </Box>

                <Text fz="13.5px" fw={600} style={{ flex: 1, minWidth: 0 }}>
                  {s.text}
                </Text>

                <ArrowUpRightIcon
                  size={15}
                  color="rgba(0,0,0,0.25)"
                  aria-hidden
                />
              </Group>
            </UnstyledButton>
          );
        })}
      </Stack>
    </Stack>
  );
}

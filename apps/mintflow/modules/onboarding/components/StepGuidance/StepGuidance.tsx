"use client";

import { Box, Group, Stack, Text } from "@peppermint/ui";
import type { Icon } from "@phosphor-icons/react";
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info";
import { ListIcon } from "@phosphor-icons/react/dist/csr/List";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { TargetIcon } from "@phosphor-icons/react/dist/csr/Target";

import { MonoText } from "@/components";
import { tokens } from "@/config/design";
import { guides } from "../../Onboarding.data";
import type { GuideIconKey } from "../../Onboarding.types";

const icons: Record<GuideIconKey, Icon> = {
  target: TargetIcon,
  list: ListIcon,
  plus: PlusIcon,
};

export function StepGuidance() {
  return (
    <Stack gap={20}>
      <Stack gap={10}>
        <MonoText label fz={11} c={tokens.accent}>
          YOU&rsquo;RE ALL SET
        </MonoText>
        <Text fw={700} fz={27} style={{ letterSpacing: -1, lineHeight: 1.08 }}>
          A quick tour before you dive in.
        </Text>
      </Stack>

      <Stack gap={12}>
        {guides.map((guide) => {
          const Icon = icons[guide.icon];
          return (
            <Group
              key={guide.title}
              gap={14}
              align="flex-start"
              wrap="nowrap"
              style={{
                background: "#fff",
                borderRadius: 16,
                border: `1px solid ${tokens.line}`,
                boxShadow: tokens.shadow.card,
                padding: 16,
              }}
            >
              <Box
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: guide.tint,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={22} color={guide.fg} />
              </Box>
              <Stack gap={4}>
                <Text fw={700} fz={15}>
                  {guide.title}
                </Text>
                <Text
                  fw={500}
                  fz={13}
                  c={tokens.muted}
                  style={{ lineHeight: 1.4 }}
                >
                  {guide.body}
                </Text>
              </Stack>
            </Group>
          );
        })}
      </Stack>

      <Group
        gap={10}
        align="center"
        wrap="nowrap"
        style={{
          background: "rgba(44, 110, 202, 0.07)",
          borderRadius: 14,
          padding: "12px 14px",
        }}
      >
        <InfoIcon size={18} color={tokens.blueInk} aria-label="Info" />
        <Text fw={500} fz={12.5} c="rgb(30, 72, 140)">
          You can change any of these later in Settings.
        </Text>
      </Group>
    </Stack>
  );
}

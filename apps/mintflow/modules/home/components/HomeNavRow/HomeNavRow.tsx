"use client";

import { CalendarBlankIcon } from "@phosphor-icons/react/dist/csr/CalendarBlank";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { SparkleIcon } from "@phosphor-icons/react/dist/csr/Sparkle";
import { Box, Group, Text, UnstyledButton } from "@peppermint/ui";

import { tokens } from "@/config/design";

import type { HomeNavRowProps } from "./HomeNavRow.types";

const icons = {
  calendar: CalendarBlankIcon,
  sparkle: SparkleIcon,
} as const;

/**
 * A leading-icon list row (Schedule / Reflect) with a faint chevron affordance.
 * Interactive only when an `onClick` handler is supplied; otherwise it renders
 * as a plain row so it is not a focusable control that does nothing.
 */
export function HomeNavRow({ label, icon, onClick }: HomeNavRowProps) {
  const Icon = icons[icon];

  const content = (
    <Group
      gap={12}
      align="center"
      wrap="nowrap"
      style={{ padding: "16px 4px" }}
    >
      <Icon size={20} color={tokens.muted} aria-hidden />
      <Text fz="16px" fw={600} c="rgba(0,0,0,0.7)">
        {label}
      </Text>
      <CaretRightIcon
        size={16}
        color="rgba(0,0,0,0.25)"
        aria-hidden
        style={{ marginLeft: "auto" }}
      />
    </Group>
  );

  if (!onClick) return <Box>{content}</Box>;

  return (
    <UnstyledButton onClick={onClick} style={{ width: "100%" }}>
      {content}
    </UnstyledButton>
  );
}

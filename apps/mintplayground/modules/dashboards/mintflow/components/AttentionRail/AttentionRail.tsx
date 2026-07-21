"use client";

import { Box, Group, Stack, Text, UnstyledButton } from "@peppermint/ui";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { ClockIcon } from "@phosphor-icons/react/dist/csr/Clock";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";

import { tokens } from "@/config/design";
import {
  ATTENTION_TONE,
  type AttentionItem,
  type AttentionTone,
} from "../../module.api";
import type { AttentionRailProps } from "./AttentionRail.types";

const TONE_ICON: Record<
  AttentionTone,
  typeof CheckIcon | typeof ClockIcon | typeof WarningIcon
> = {
  approval: CheckIcon,
  hold: ClockIcon,
  deadline: WarningIcon,
};

/** One exception + its single next-action link (spec §8 — exceptions only). */
function AttentionRow({
  item,
  first,
  onAction,
}: {
  item: AttentionItem;
  first: boolean;
  onAction: (item: AttentionItem) => void;
}) {
  const tone = ATTENTION_TONE[item.tone];
  const Icon = TONE_ICON[item.tone];

  return (
    <Group
      gap={11}
      wrap="nowrap"
      align="flex-start"
      py={12}
      style={{ borderTop: first ? undefined : `1px solid ${tokens.line}` }}
    >
      <Box
        w={32}
        h={32}
        style={{
          borderRadius: 10,
          background: tone.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "0 0 auto",
        }}
      >
        <Icon size={15} color={tone.fg} weight="bold" />
      </Box>

      <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
        <Text fz="12.5px" fw={600} c={tokens.ink} style={{ lineHeight: 1.3 }}>
          {item.statement}
        </Text>
        <Text
          fz="11.5px"
          fw={500}
          c={tokens.muted2}
          style={{ lineHeight: 1.4 }}
        >
          {item.detail}
        </Text>
        <UnstyledButton onClick={() => onAction(item)} mt={4}>
          <Group gap={4} wrap="nowrap" align="center">
            <Text fz="12px" fw={700} c={tone.fg}>
              {item.actionLabel}
            </Text>
            <ArrowRightIcon size={12} weight="bold" color={tone.fg} />
          </Group>
        </UnstyledButton>
      </Stack>
    </Group>
  );
}

/** Calm, positive readout when there are no exceptions (spec §8). */
function EmptyState() {
  return (
    <Stack align="center" gap={8} py={20}>
      <CheckCircleIcon size={30} color={tokens.green} weight="duotone" />
      <Stack align="center" gap={2}>
        <Text fz="13px" fw={700} c={tokens.ink}>
          Nothing needs your attention
        </Text>
        <Text fz="11.5px" fw={500} c={tokens.muted2}>
          You&rsquo;re all caught up.
        </Text>
      </Stack>
    </Stack>
  );
}

export function AttentionRail({ items, onAction }: AttentionRailProps) {
  // loading / error / permission handled by the parent ModuleMintflow.
  return (
    <Box style={{ padding: "18px 18px 8px" }}>
      <Text
        component="h3"
        fw={700}
        c={tokens.ink}
        style={{ fontSize: 15, letterSpacing: "-0.2px" }}
      >
        Needs your attention
      </Text>
      <Text
        fz="11.5px"
        fw={500}
        c={tokens.muted}
        mt={3}
        mb={items.length ? 6 : 0}
      >
        Exceptions only — not a re-list of your work.
      </Text>

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <Stack gap={0}>
          {items.map((item, i) => (
            <AttentionRow
              key={item.id}
              item={item}
              first={i === 0}
              onAction={onAction}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}

"use client";

import { Box, Button, Group, Paper, Stack, Text } from "@peppermint/ui";
import { SealCheckIcon } from "@phosphor-icons/react/dist/csr/SealCheck";
import { PauseCircleIcon } from "@phosphor-icons/react/dist/csr/PauseCircle";
import { ClockCountdownIcon } from "@phosphor-icons/react/dist/csr/ClockCountdown";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";

import { SectionLabel } from "@/components";
import { tokens } from "@/config/design";
import {
  ATTENTION_TONE,
  type AttentionItem,
  type AttentionTone,
} from "../../module.api";
import type { AttentionRailProps } from "./AttentionRail.types";

const TONE_ICON: Record<
  AttentionTone,
  typeof SealCheckIcon | typeof PauseCircleIcon | typeof ClockCountdownIcon
> = {
  approval: SealCheckIcon,
  hold: PauseCircleIcon,
  deadline: ClockCountdownIcon,
};

/** One exception + its single next-action lever. */
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
      gap={14}
      wrap="nowrap"
      align="flex-start"
      py={13}
      style={{ borderTop: first ? undefined : `1px solid ${tokens.line}` }}
    >
      <Box
        w={38}
        h={38}
        style={{
          borderRadius: 11,
          background: tone.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "0 0 auto",
        }}
      >
        <Icon size={18} color={tone.fg} weight="duotone" />
      </Box>

      <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
        <Text fz="13px" fw={700} c={tokens.ink} style={{ lineHeight: 1.3 }}>
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
      </Stack>

      <Button
        size="compact-sm"
        variant="light"
        color="gray"
        radius="xl"
        onClick={() => onAction(item)}
        style={{ flex: "0 0 auto" }}
      >
        {item.actionLabel}
      </Button>
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
  // loading/error/permission handled by the parent ModuleDashboard
  return (
    <Paper
      p={18}
      radius={tokens.radius.tile}
      withBorder
      style={{ background: "#fff", boxShadow: tokens.shadow.card }}
    >
      <SectionLabel>Needs your attention</SectionLabel>

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <Stack gap={0} mt={4}>
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
    </Paper>
  );
}

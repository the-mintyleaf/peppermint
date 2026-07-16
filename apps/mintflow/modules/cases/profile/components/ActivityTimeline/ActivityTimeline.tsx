"use client";

import { Anchor, Box, Group, Stack, Text } from "@peppermint/ui";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { ClockCountdownIcon } from "@phosphor-icons/react/dist/csr/ClockCountdown";
import { FileArrowUpIcon } from "@phosphor-icons/react/dist/csr/FileArrowUp";
import { FlagBannerIcon } from "@phosphor-icons/react/dist/csr/FlagBanner";
import { NoteIcon } from "@phosphor-icons/react/dist/csr/Note";
import { SparkleIcon } from "@phosphor-icons/react/dist/csr/Sparkle";
import type { Icon } from "@phosphor-icons/react";

import { MonoText } from "@/components";
import { tokens } from "@/config/design";
import { ACTIVITY_STYLE, caseProgress } from "../../profile.api";
import type { CaseActivityKind } from "../../profile.api";
import type { ActivityTimelineProps } from "./ActivityTimeline.types";

const ACTIVITY_ICON: Record<CaseActivityKind, Icon> = {
  opened: FlagBannerIcon,
  task_done: CheckIcon,
  task_progress: ClockCountdownIcon,
  file: FileArrowUpIcon,
  status: SparkleIcon,
  note: NoteIcon,
};

function SummaryChip({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <Group
      gap={8}
      wrap="nowrap"
      px={13}
      py={9}
      style={{ background: tokens.paper2, borderRadius: 11 }}
    >
      <Text fz="12px" fw={600} c={tokens.muted2}>
        {label}
      </Text>
      <MonoText fz="13px" fw={700} c={valueColor ?? tokens.ink}>
        {value}
      </MonoText>
    </Group>
  );
}

/** Vertical case activity feed derived from tasks, files, and open/due dates. */
export function ActivityTimeline({
  workCase,
  events,
  filterLabel,
  onClearFilter,
}: ActivityTimelineProps) {
  const progress = caseProgress(workCase);

  return (
    <Stack gap={22}>
      <Group gap={10} wrap="wrap">
        <SummaryChip
          label="Completed"
          value={`${progress.done}/${progress.total}`}
        />
        <SummaryChip label="Officers" value={`${workCase.officers.length}`} />
        <SummaryChip
          label="Departments"
          value={`${workCase.departments.length}`}
        />
      </Group>

      {filterLabel ? (
        <Group gap={8} wrap="nowrap">
          <Text fz="12px" c={tokens.muted2}>
            Showing activity for “{filterLabel}”
          </Text>
          {onClearFilter ? (
            <Anchor
              component="button"
              type="button"
              fz="12px"
              c="accent"
              fw={600}
              onClick={onClearFilter}
            >
              Clear
            </Anchor>
          ) : null}
        </Group>
      ) : null}

      {events.length === 0 ? (
        <Text fz="sm" c="dimmed" ta="center" py="lg">
          {filterLabel
            ? "No activity for this task yet."
            : "No activity recorded yet."}
        </Text>
      ) : (
        <Stack gap={0}>
          {events.map((entry, index) => {
            const style = ACTIVITY_STYLE[entry.kind];
            const Glyph = ACTIVITY_ICON[entry.kind];
            const isLast = index === events.length - 1;
            return (
              <Group key={entry.id} gap={15} align="stretch" wrap="nowrap">
                <Stack gap={4} align="center" style={{ flexShrink: 0 }}>
                  <Box
                    w={34}
                    h={34}
                    style={{
                      borderRadius: 11,
                      background: style.ring,
                      color: style.fg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Glyph size={16} weight="bold" />
                  </Box>
                  {!isLast ? (
                    <Box
                      w={2}
                      style={{
                        flex: 1,
                        background: tokens.line,
                        borderRadius: 2,
                      }}
                    />
                  ) : null}
                </Stack>

                <Box pb={isLast ? 0 : 22} style={{ minWidth: 0, flex: 1 }}>
                  <Group gap={8} align="baseline" wrap="wrap">
                    <Text fz="14px" fw={700} c={tokens.ink}>
                      {entry.title}
                    </Text>
                    <Text fz="13px" c={tokens.muted2}>
                      {entry.who}
                    </Text>
                  </Group>
                  {entry.when ? (
                    <MonoText fz="12px" fw={600} mt={3} c={tokens.muted}>
                      {entry.when}
                    </MonoText>
                  ) : null}
                  {entry.note ? (
                    <Text
                      fz="13px"
                      mt={10}
                      px={13}
                      py={10}
                      c={tokens.muted2}
                      style={{
                        background: tokens.paper2,
                        border: `1px solid ${tokens.line}`,
                        borderRadius: 10,
                        lineHeight: 1.5,
                      }}
                    >
                      {entry.note}
                    </Text>
                  ) : null}
                </Box>
              </Group>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}

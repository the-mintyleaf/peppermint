"use client";

import type { ReactNode } from "react";
import {
  Center,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  dayjs,
} from "@peppermint/ui";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowsClockwise";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ClockCounterClockwise";
import { NoteBlankIcon } from "@phosphor-icons/react/dist/csr/NoteBlank";
import { PhoneCallIcon } from "@phosphor-icons/react/dist/csr/PhoneCall";
import { PlusCircleIcon } from "@phosphor-icons/react/dist/csr/PlusCircle";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { SwapIcon } from "@phosphor-icons/react/dist/csr/Swap";
import { useLeadHistory } from "../../../../leadManagement.hooks";
import type {
  HistoryAction,
  HistoryEntry,
} from "../../../../leadManagement.types";

/** One glyph + tint per action family — recognition over recall, one icon per concept. */
const ACTION_ICON: Partial<
  Record<HistoryAction, { icon: ReactNode; color: string }>
> = {
  lead_created: {
    icon: <PlusCircleIcon size={14} aria-hidden />,
    color: "blue",
  },
  lead_stage_changed: {
    icon: <ArrowsClockwiseIcon size={14} aria-hidden />,
    color: "grape",
  },
  lead_followup_recorded: {
    icon: <PhoneCallIcon size={14} aria-hidden />,
    color: "teal",
  },
  lead_note_added: {
    icon: <NoteBlankIcon size={14} aria-hidden />,
    color: "gray",
  },
  lead_marked_lost: {
    icon: <ProhibitIcon size={14} aria-hidden />,
    color: "red",
  },
  lead_reopened: {
    icon: <ClockCounterClockwiseIcon size={14} aria-hidden />,
    color: "teal",
  },
  lead_converted: { icon: <SwapIcon size={14} aria-hidden />, color: "green" },
};

const FALLBACK_ICON = {
  icon: <ClockCounterClockwiseIcon size={14} aria-hidden />,
  color: "gray",
};

function renderValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

/** One audit entry — a contained card led by its action glyph. */
function HistoryCard({ entry }: { entry: HistoryEntry }) {
  const { icon, color } = ACTION_ICON[entry.action] ?? FALLBACK_ICON;
  const changeEntries = Object.entries(entry.changes);

  return (
    <Paper withBorder radius="md" p="md">
      <Group align="flex-start" wrap="nowrap" gap="sm">
        <ThemeIcon variant="light" color={color} size="md" radius="xl">
          {icon}
        </ThemeIcon>
        <Stack gap={4} style={{ flex: 1 }}>
          <Text size="sm" fw={600}>
            {entry.summary || entry.action.replace(/_/g, " ")}
          </Text>
          <Text size="xs" c="dimmed">
            {dayjs(entry.created_at).format("MMM D, YYYY h:mm A")} ·{" "}
            {entry.actor_label || `(${entry.actor_type})`}
          </Text>
          {entry.reason ? <Text size="sm">Reason: {entry.reason}</Text> : null}
          {changeEntries.map(([field, change]) => (
            <Text key={field} size="xs" c="dimmed">
              {field}: {renderValue(change.from)} → {renderValue(change.to)}
            </Text>
          ))}
        </Stack>
      </Group>
    </Paper>
  );
}

/**
 * Read-only, server-written, backed by the central audit log — `summary` is
 * the primary label per entry; `changes`/`metadata` are advisory detail, not
 * a fixed schema (`docs/backend/lead-management/INTEGRATION.md` §4).
 */
export function LeadHistoryPanel({ leadId }: { leadId: string }) {
  const { data, isLoading } = useLeadHistory(leadId);
  const entries = data?.data ?? [];
  const truncated = (data?.meta.total ?? 0) > entries.length;

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader size="sm" />
      </Center>
    );
  }

  if (entries.length === 0) {
    return (
      <Stack align="center" gap="xs" py="xl">
        <ClockCounterClockwiseIcon size={28} aria-hidden />
        <Text size="sm" c="dimmed">
          No history yet.
        </Text>
      </Stack>
    );
  }

  return (
    <Stack gap="sm">
      {entries.map((entry) => (
        <HistoryCard key={entry.id} entry={entry} />
      ))}
      {truncated ? (
        <Text size="xs" c="dimmed" ta="center">
          Showing the {entries.length} most recent entries.
        </Text>
      ) : null}
    </Stack>
  );
}

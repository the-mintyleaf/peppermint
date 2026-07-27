"use client";

import type { ReactNode } from "react";
import { Center, Loader, Stack, Text } from "@peppermint/ui";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowsClockwise";
import { PauseCircleIcon } from "@phosphor-icons/react/dist/csr/PauseCircle";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { PlusCircleIcon } from "@phosphor-icons/react/dist/csr/PlusCircle";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { HistoryTable, ProfilePanelHeader } from "@/components/profile";
import { QueryErrorState } from "@/components/QueryErrorState";
import { useJourneyHistory } from "../../../applicantJourneys.hooks";

/** Best-effort per-action glyphs; `HistoryTable` falls back to a clock. */
const ICONS: Record<string, { icon: ReactNode; color: string }> = {
  journey_created: {
    icon: <PlusCircleIcon size={14} aria-hidden />,
    color: "blue",
  },
  journey_updated: {
    icon: <PencilSimpleIcon size={14} aria-hidden />,
    color: "gray",
  },
  journey_stage_changed: {
    icon: <ArrowsClockwiseIcon size={14} aria-hidden />,
    color: "grape",
  },
  journey_closed: {
    icon: <ProhibitIcon size={14} aria-hidden />,
    color: "red",
  },
  journey_deferred: {
    icon: <PauseCircleIcon size={14} aria-hidden />,
    color: "orange",
  },
  journey_reopened: {
    icon: <ArrowCounterClockwiseIcon size={14} aria-hidden />,
    color: "teal",
  },
};

/**
 * Read-only, server-written, backed by the central audit log — the same
 * table as every other profile (`HistoryTable`). Closure/
 * deferment **reasons** live on the journey record and show in the Overview,
 * not here (`docs/backend/applicant-journeys/FLOWS.md`).
 */
export function JourneyHistoryPanel({ journeyId }: { journeyId: string }) {
  const { data, isLoading, isError, isRefetching, refetch } =
    useJourneyHistory(journeyId);
  const entries = data?.data ?? [];
  const truncated = (data?.meta.total ?? 0) > entries.length;

  return (
    <Stack gap="md">
      <ProfilePanelHeader
        title="History"
        description="Recorded automatically — read only"
      />

      {isLoading ? (
        <Center py="xl">
          <Loader size="sm" />
        </Center>
      ) : isError ? (
        <QueryErrorState
          message="Couldn't load history."
          onRetry={() => refetch()}
          isRetrying={isRefetching}
        />
      ) : entries.length === 0 ? (
        <Text size="xs" c="dimmed">
          No history yet.
        </Text>
      ) : (
        <HistoryTable
          entries={entries}
          iconFor={(action) => ICONS[action]}
          truncatedNote={
            truncated
              ? `Showing the ${entries.length} most recent entries.`
              : undefined
          }
        />
      )}
    </Stack>
  );
}

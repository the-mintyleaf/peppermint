"use client";

import { Card, Group, Stack, Text } from "@peppermint/ui";
import { useDashboardSummary } from "../dashboard.hooks";
import { DASHBOARD_TAB_META, type DashboardTab } from "../dashboard.tabs";
import type { DashboardSummary } from "../dashboard.types";
import { MeterBar } from "./MeterBar";
import { SectionState } from "./SectionState";
import type { NeedsAttentionProps } from "./NeedsAttention.types";

type AlertKey = keyof DashboardSummary["alerts"];

const ALERT_LABELS: Record<AlertKey, string> = {
  overdue_checklist_items: "Overdue checklist items",
  due_soon_checklist_items: "Due soon",
  blocked_checklist_items: "Blocked checklist items",
  offers_awaiting_response: "Offers awaiting response",
  files_awaiting_verification: "Files awaiting verification",
  rejected_files: "Rejected files",
  stale_leads: "Stale leads",
  journeys_without_a_checklist: "Journeys without a checklist",
};

/** The tab whose section carries the actual rows behind each alert. */
const ALERT_TABS: Record<AlertKey, DashboardTab> = {
  overdue_checklist_items: "today",
  due_soon_checklist_items: "today",
  offers_awaiting_response: "today",
  files_awaiting_verification: "today",
  stale_leads: "today",
  blocked_checklist_items: "blockers",
  rejected_files: "blockers",
  journeys_without_a_checklist: "blockers",
};

// Severity is paired with the word + number + position, never carried by color
// alone: red = an SLA already breached, orange = at-risk/aging, gray = a routine
// queue of outstanding work.
const ALERT_COLORS: Record<AlertKey, string> = {
  overdue_checklist_items: "red",
  rejected_files: "red",
  blocked_checklist_items: "orange",
  stale_leads: "orange",
  journeys_without_a_checklist: "orange",
  offers_awaiting_response: "gray",
  files_awaiting_verification: "gray",
  due_soon_checklist_items: "gray",
};

const ALERT_KEYS = Object.keys(ALERT_LABELS) as AlertKey[];

/** Severity first, then volume — an overdue 3 outranks a routine 40. */
const SEVERITY_RANK: Record<string, number> = { red: 0, orange: 1, gray: 2 };

/**
 * The exceptions panel — the first thing the eye lands on, and the only place on
 * Overview that says "a human is needed here". Every row is a number PLUS a
 * destination (CONCEPT.md "Alert strip"): activating it opens the tab holding
 * the actual rows, which is why the row is a button and not a link — nothing
 * navigates, the page switches view.
 *
 * Rows are ordered by severity band, then by size within the band, so the top of
 * the list is always the thing to do first. Bar width is `value / max` across
 * the whole set — a relative-volume cue only; the number is the fact.
 */
export function NeedsAttention({ filters, onOpenTab }: NeedsAttentionProps) {
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardSummary(filters);

  return (
    <Card withBorder radius="lg" p="lg" h="100%">
      <Stack gap="md" h="100%">
        <Group justify="space-between" align="baseline">
          <Text fw={600} size="sm">
            Needs attention
          </Text>
          <Text size="xs" c="dimmed" ff="monospace">
            most urgent first
          </Text>
        </Group>

        <SectionState
          isPending={isPending}
          isError={isError}
          errorMessage="Couldn't load the alert strip."
          onRetry={() => refetch()}
          isRetrying={isRefetching}
          skeletonHeight={220}
        >
          {data ? (
            <AlertBars alerts={data.alerts} onOpenTab={onOpenTab} />
          ) : null}
        </SectionState>

        {data ? (
          <Text size="xs" c="dimmed">
            Due-soon horizon: {data.due_within_days} days.
          </Text>
        ) : null}
      </Stack>
    </Card>
  );
}

function AlertBars({
  alerts,
  onOpenTab,
}: {
  alerts: DashboardSummary["alerts"];
  onOpenTab: (tab: DashboardTab) => void;
}) {
  const max = Math.max(1, ...ALERT_KEYS.map((key) => alerts[key]));

  const ordered = [...ALERT_KEYS].sort((a, b) => {
    const bySeverity =
      SEVERITY_RANK[ALERT_COLORS[a]] - SEVERITY_RANK[ALERT_COLORS[b]];
    return bySeverity !== 0 ? bySeverity : alerts[b] - alerts[a];
  });

  const allClear = ALERT_KEYS.every((key) => alerts[key] === 0);

  return (
    <Stack gap="sm">
      {allClear ? (
        <Text size="sm" c="dimmed">
          Nothing is waiting on a human right now — every queue is clear.
        </Text>
      ) : null}
      {ordered.map((key) => (
        <MeterBar
          key={key}
          label={ALERT_LABELS[key]}
          value={alerts[key]}
          max={max}
          color={ALERT_COLORS[key]}
          muted={alerts[key] === 0}
          labelWidth={168}
          onActivate={() => onOpenTab(ALERT_TABS[key])}
          activateLabel={`${ALERT_LABELS[key]}: ${alerts[key]}. Open ${DASHBOARD_TAB_META[ALERT_TABS[key]].label}.`}
        />
      ))}
    </Stack>
  );
}

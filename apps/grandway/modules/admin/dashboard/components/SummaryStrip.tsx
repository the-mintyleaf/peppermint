"use client";

import { Card, Grid, Group, SimpleGrid, Stack, Text } from "@peppermint/ui";
import { useDashboardSummary } from "../dashboard.hooks";
import type { DashboardFilters } from "../dashboard.types";
import { MeterBar } from "./MeterBar";
import { SectionState } from "./SectionState";

/**
 * The alert strip — `useDashboardSummary()`. Every alert is a number PLUS a
 * destination (CONCEPT.md "Alert strip"): each links to the in-page section that
 * carries the fuller detail (INTEGRATION.md §4) rather than an external route —
 * there is no drill-down contract for query params on the owning apps' lists
 * (§9), so an in-page anchor is the honest destination. Volumes are context, not
 * alerts, so they render as plain hero stats with no link.
 */
const ALERT_ORDER = [
  "overdue_checklist_items",
  "rejected_files",
  "blocked_checklist_items",
  "stale_leads",
  "journeys_without_a_checklist",
  "offers_awaiting_response",
  "files_awaiting_verification",
  "due_soon_checklist_items",
] as const;

const ALERT_LABELS: Record<string, string> = {
  overdue_checklist_items: "Overdue checklist items",
  due_soon_checklist_items: "Due soon",
  blocked_checklist_items: "Blocked checklist items",
  offers_awaiting_response: "Offers awaiting response",
  files_awaiting_verification: "Files awaiting verification",
  rejected_files: "Rejected files",
  stale_leads: "Stale leads",
  journeys_without_a_checklist: "Journeys without a checklist",
};

const ALERT_DESTINATIONS: Record<string, string> = {
  overdue_checklist_items: "#today-worklists",
  due_soon_checklist_items: "#today-worklists",
  blocked_checklist_items: "#blockers",
  offers_awaiting_response: "#today-worklists",
  files_awaiting_verification: "#today-worklists",
  rejected_files: "#blockers",
  stale_leads: "#today-worklists",
  journeys_without_a_checklist: "#blockers",
};

// Severity is paired with the word + number + position, never carried by color
// alone: red = an SLA already breached, orange = at-risk/aging, gray = a routine
// queue of outstanding work.
const ALERT_COLORS: Record<string, string> = {
  overdue_checklist_items: "red",
  rejected_files: "red",
  blocked_checklist_items: "orange",
  stale_leads: "orange",
  journeys_without_a_checklist: "orange",
  offers_awaiting_response: "gray",
  files_awaiting_verification: "gray",
  due_soon_checklist_items: "gray",
};

function VolumeStat({ value, label }: { value: number; label: string }) {
  return (
    <Stack gap={2}>
      <Text fz={26} fw={700} lh={1} style={{ letterSpacing: "-0.03em" }}>
        {value.toLocaleString()}
      </Text>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
    </Stack>
  );
}

export function SummaryStrip({ filters }: { filters: DashboardFilters }) {
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardSummary(filters);

  return (
    <SectionState
      isPending={isPending}
      isError={isError}
      errorMessage="Couldn't load the alert strip."
      onRetry={() => refetch()}
      isRetrying={isRefetching}
      skeletonHeight={180}
    >
      {data ? (
        <Grid>
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Card withBorder radius="lg" p="lg" h="100%">
              <Stack gap="lg" justify="space-between" h="100%">
                <SimpleGrid cols={3} spacing="lg">
                  <VolumeStat
                    value={data.volumes.leads_total}
                    label="Total leads"
                  />
                  <VolumeStat
                    value={data.volumes.applicants_active}
                    label="Active applicants"
                  />
                  <VolumeStat
                    value={data.volumes.journeys_total}
                    label="Total journeys"
                  />
                </SimpleGrid>
                <Text size="xs" c="dimmed">
                  Due-soon horizon: {data.due_within_days} days. Figures reflect
                  the moment this section was last fetched.
                </Text>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 7 }}>
            <Card withBorder radius="lg" p="lg" h="100%">
              <Stack gap="md">
                <Group justify="space-between" align="baseline">
                  <Text fw={600} size="sm">
                    Needs attention
                  </Text>
                  <Text size="xs" c="dimmed" ff="monospace">
                    relative volume
                  </Text>
                </Group>
                <AlertBars alerts={data.alerts} />
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      ) : null}
    </SectionState>
  );
}

function AlertBars({ alerts }: { alerts: Record<string, number> }) {
  const max = Math.max(1, ...ALERT_ORDER.map((key) => alerts[key] ?? 0));

  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm" verticalSpacing="sm">
      {ALERT_ORDER.map((key) => (
        <MeterBar
          key={key}
          label={ALERT_LABELS[key]}
          value={alerts[key] ?? 0}
          max={max}
          color={ALERT_COLORS[key]}
          href={ALERT_DESTINATIONS[key]}
          labelWidth={140}
        />
      ))}
    </SimpleGrid>
  );
}

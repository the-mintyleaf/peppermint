"use client";

import Link from "next/link";
import { Anchor, Card, Group, SimpleGrid, Stack, Text } from "@peppermint/ui";
import { useDashboardSummary } from "../dashboard.hooks";
import { SectionState } from "./SectionState";

/**
 * The alert strip — `useDashboardSummary()`. Every alert is a number PLUS a
 * destination (CONCEPT.md "Alert strip"): each links to the in-page section
 * that carries the fuller detail (INTEGRATION.md §4 "every figure is
 * duplicated in a fuller section below") rather than an external list route —
 * there is no drill-down contract for query params on the owning apps' list
 * views (§9), so an in-page anchor is the honest destination, not a guess.
 * Volumes are context, not alerts, so they render as plain stat tiles with no
 * link.
 */
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

export function SummaryStrip() {
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardSummary();

  return (
    <SectionState
      isPending={isPending}
      isError={isError}
      errorMessage="Couldn't load the alert strip."
      onRetry={() => refetch()}
      isRetrying={isRefetching}
      skeletonHeight={100}
    >
      {data ? (
        <Stack gap="sm">
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
            {(Object.keys(data.alerts) as Array<keyof typeof data.alerts>).map(
              (key) => (
                <Card key={key} withBorder radius="md" p="sm">
                  <Stack gap={2}>
                    <Text size="xl" fw={700}>
                      {data.alerts[key]}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {ALERT_LABELS[key]}
                    </Text>
                    <Anchor
                      component={Link}
                      href={ALERT_DESTINATIONS[key]}
                      size="xs"
                    >
                      View
                    </Anchor>
                  </Stack>
                </Card>
              ),
            )}
          </SimpleGrid>

          <Group gap="lg">
            <Text size="sm" c="dimmed">
              {data.volumes.leads_total} leads total
            </Text>
            <Text size="sm" c="dimmed">
              {data.volumes.applicants_active} active applicants
            </Text>
            <Text size="sm" c="dimmed">
              {data.volumes.journeys_total} journeys total
            </Text>
            <Text size="sm" c="dimmed">
              Due-soon horizon: {data.due_within_days} days
            </Text>
          </Group>
        </Stack>
      ) : null}
    </SectionState>
  );
}

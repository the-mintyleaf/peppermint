"use client";

import { Card, Grid, Stack, Text } from "@peppermint/ui";
import { OUTCOME_LABELS } from "@/modules/admin/applicant-journeys/applicantJourneys.labels";
import { DECISION_OUTCOME_LABELS } from "@/modules/admin/offers/offers.labels";
import { useDashboardOutcomes } from "../dashboard.hooks";
import {
  JOURNEY_OUTCOME_COLORS,
  OFFER_DECISION_COLORS,
} from "../dashboard.labels";
import { DonutStat } from "./DonutStat";
import { MeterBar } from "./MeterBar";
import { SectionState } from "./SectionState";
import type { OutcomesProps } from "./Outcomes.types";

/**
 * `journey_outcomes` is windowed on when a journey ENDED; every other count here
 * (`journeys_completed`/`journeys_closed`, applicant + checklist figures) is
 * windowed on CREATION (INTEGRATION.md §7). They are rendered as three visually
 * separate cards with distinct captions, never combined into one total.
 */
export function Outcomes({ filters }: OutcomesProps) {
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardOutcomes(filters);

  return (
    <SectionState
      isPending={isPending}
      isError={isError}
      errorMessage="Couldn't load final outcomes."
      onRetry={() => refetch()}
      isRetrying={isRefetching}
      skeletonHeight={220}
    >
      {data ? (
        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder radius="lg" p="lg" h="100%">
              <Stack gap="md">
                <Stack gap={2}>
                  <Text fw={600} size="sm">
                    Journey outcomes
                  </Text>
                  <Text size="xs" c="dimmed">
                    Windowed on when each journey ended.
                  </Text>
                </Stack>
                <JourneyOutcomesDonut outcomes={data.journey_outcomes} />
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder radius="lg" p="lg" h="100%">
              <Stack gap="md">
                <Stack gap={2}>
                  <Text fw={600} size="sm">
                    Offer decisions
                  </Text>
                  <Text size="xs" c="dimmed">
                    Keyed on when each decision was recorded.
                  </Text>
                </Stack>
                <OfferDecisionsDonut decisions={data.offer_decisions} />
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder radius="lg" p="lg" h="100%">
              <Stack gap="md">
                <Stack gap={2}>
                  <Text fw={600} size="sm">
                    Closed &amp; archived
                  </Text>
                  <Text size="xs" c="dimmed">
                    Created in this window — a separate count from the outcomes
                    ring.
                  </Text>
                </Stack>
                <ClosedArchivedBars data={data} />
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      ) : null}
    </SectionState>
  );
}

function JourneyOutcomesDonut({
  outcomes,
}: {
  outcomes: Record<string, number>;
}) {
  const items = (
    Object.keys(outcomes) as Array<keyof typeof OUTCOME_LABELS>
  ).map((key) => ({
    label: OUTCOME_LABELS[key],
    value: outcomes[key],
    color: JOURNEY_OUTCOME_COLORS[key],
  }));
  const total = items.reduce((sum, item) => sum + item.value, 0);
  return (
    <DonutStat
      items={items}
      centerValue={total}
      centerLabel="closed"
      layout="horizontal"
      size={118}
    />
  );
}

function OfferDecisionsDonut({
  decisions,
}: {
  decisions: Record<string, number>;
}) {
  const items = (
    Object.keys(decisions) as Array<keyof typeof DECISION_OUTCOME_LABELS>
  ).map((key) => ({
    label: DECISION_OUTCOME_LABELS[key],
    value: decisions[key],
    color: OFFER_DECISION_COLORS[key],
  }));
  const total = items.reduce((sum, item) => sum + item.value, 0);
  return (
    <DonutStat
      items={items}
      centerValue={total}
      centerLabel="decisions"
      layout="horizontal"
      size={118}
    />
  );
}

function ClosedArchivedBars({
  data,
}: {
  data: {
    journeys_completed: number;
    journeys_closed: number;
    checklists_completed: number;
    checklists_archived: number;
    applicants_dormant: number;
    applicants_archived: number;
  };
}) {
  const rows = [
    {
      key: "journeys_completed",
      label: "Journeys completed",
      value: data.journeys_completed,
    },
    {
      key: "journeys_closed",
      label: "Journeys closed",
      value: data.journeys_closed,
    },
    {
      key: "checklists_completed",
      label: "Checklists completed",
      value: data.checklists_completed,
    },
    {
      key: "checklists_archived",
      label: "Checklists archived",
      value: data.checklists_archived,
    },
    {
      key: "applicants_dormant",
      label: "Applicants dormant",
      value: data.applicants_dormant,
    },
    {
      key: "applicants_archived",
      label: "Applicants archived",
      value: data.applicants_archived,
    },
  ];
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <Stack gap="xs">
      {rows.map((r) => (
        <MeterBar
          key={r.key}
          label={r.label}
          value={r.value}
          max={max}
          muted={r.value === 0}
          labelWidth={148}
        />
      ))}
    </Stack>
  );
}

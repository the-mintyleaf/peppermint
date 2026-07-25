"use client";

import { Badge, Card, Group, SimpleGrid, Stack, Text } from "@peppermint/ui";
import { OUTCOME_LABELS } from "@/modules/admin/applicant-journeys/applicantJourneys.labels";
import { DECISION_OUTCOME_LABELS } from "@/modules/admin/offers/offers.labels";
import { useDashboardOutcomes } from "../dashboard.hooks";
import { SectionState } from "./SectionState";
import type { OutcomesProps } from "./Outcomes.types";

function CountTile({ label, count }: { label: string; count: number }) {
  return (
    <Stack gap={0} align="center">
      <Text size="lg" fw={700}>
        {count}
      </Text>
      <Text size="xs" c="dimmed" ta="center">
        {label}
      </Text>
    </Stack>
  );
}

/**
 * `journey_outcomes` is windowed on when a journey ENDED; `journeys_completed`/
 * `journeys_closed` (same payload) on when it was CREATED (INTEGRATION.md §7
 * "outcomes") — rendered as two visually separate groups with distinct
 * captions, never combined into one total.
 */
export function Outcomes({ filters }: OutcomesProps) {
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardOutcomes(filters);

  return (
    <Stack gap="sm">
      <Text fw={700}>Final outcomes</Text>
      <SectionState
        isPending={isPending}
        isError={isError}
        errorMessage="Couldn't load final outcomes."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
        skeletonHeight={260}
      >
        {data ? (
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="sm">
            <Card withBorder radius="md" p="md">
              <Stack gap="xs">
                <Text size="sm" fw={600}>
                  Journey outcomes
                </Text>
                <Text size="xs" c="dimmed">
                  Windowed on when each journey ended.
                </Text>
                <Group gap="lg">
                  {(
                    Object.keys(data.journey_outcomes) as Array<
                      keyof typeof data.journey_outcomes
                    >
                  ).map((key) => (
                    <Badge key={key} variant="light" size="lg">
                      {OUTCOME_LABELS[key]}: {data.journey_outcomes[key]}
                    </Badge>
                  ))}
                </Group>
              </Stack>
            </Card>

            <Card withBorder radius="md" p="md">
              <Stack gap="xs">
                <Text size="sm" fw={600}>
                  Offer decisions
                </Text>
                <Text size="xs" c="dimmed">
                  Keyed on when each decision was recorded.
                </Text>
                <Group gap="lg">
                  {(
                    Object.keys(data.offer_decisions) as Array<
                      keyof typeof data.offer_decisions
                    >
                  ).map((key) => (
                    <Badge key={key} variant="light" size="lg">
                      {DECISION_OUTCOME_LABELS[key]}:{" "}
                      {data.offer_decisions[key]}
                    </Badge>
                  ))}
                </Group>
              </Stack>
            </Card>

            <Card withBorder radius="md" p="md">
              <Stack gap="xs">
                <Text size="sm" fw={600}>
                  Journeys — created in this window
                </Text>
                <Group gap="lg">
                  <CountTile
                    label="Completed"
                    count={data.journeys_completed}
                  />
                  <CountTile label="Closed" count={data.journeys_closed} />
                </Group>
              </Stack>
            </Card>

            <Card withBorder radius="md" p="md">
              <Stack gap="xs">
                <Text size="sm" fw={600}>
                  Applicants and checklists — created in this window
                </Text>
                <Group gap="lg">
                  <CountTile
                    label="Applicants archived"
                    count={data.applicants_archived}
                  />
                  <CountTile
                    label="Applicants dormant"
                    count={data.applicants_dormant}
                  />
                  <CountTile
                    label="Checklists completed"
                    count={data.checklists_completed}
                  />
                  <CountTile
                    label="Checklists archived"
                    count={data.checklists_archived}
                  />
                </Group>
              </Stack>
            </Card>
          </SimpleGrid>
        ) : null}
      </SectionState>
    </Stack>
  );
}

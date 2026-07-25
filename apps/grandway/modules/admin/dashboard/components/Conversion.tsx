"use client";

import { Card, Group, SimpleGrid, Stack, Table, Text } from "@peppermint/ui";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { useDashboardConversion } from "../dashboard.hooks";
import { formatRatePercent } from "../dashboard.utils";
import type { Rate } from "../dashboard.types";
import { SectionState } from "./SectionState";
import type { ConversionProps } from "./Conversion.types";

function RateCard({
  title,
  rate,
  scopedCaption,
}: {
  title: string;
  rate: Rate;
  scopedCaption?: string;
}) {
  return (
    <Card withBorder radius="md" p="md">
      <Stack gap={2}>
        <Text size="xs" c="dimmed">
          {title}
        </Text>
        <Text size="xl" fw={700}>
          {formatRatePercent(rate.percent)}
        </Text>
        <Text size="xs" c="dimmed">
          {rate.numerator} of {rate.denominator}
        </Text>
        {scopedCaption ? (
          <Text size="xs" c="dimmed" fs="italic">
            {scopedCaption}
          </Text>
        ) : null}
      </Stack>
    </Card>
  );
}

/**
 * Four INDEPENDENT rates — never a funnel, never multiplied together
 * (INTEGRATION.md §7 "conversion": each is windowed on its own stage's
 * dates). `by_source`/`lead_to_applicant` are owner-scoped for a Lead
 * Manager; the other three are not, and the payload carries no per-field
 * flag to say so (§9) — this component derives the caption from the
 * caller's own authority instead of guessing from the response.
 */
export function Conversion({ filters }: ConversionProps) {
  const { isLeadManager } = useCurrentUser();
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardConversion(filters);

  const scopedCaption = isLeadManager ? "Scoped to your own leads." : undefined;

  return (
    <Stack gap="sm">
      <Text fw={700}>Source and conversion</Text>
      <SectionState
        isPending={isPending}
        isError={isError}
        errorMessage="Couldn't load conversion figures."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
        skeletonHeight={240}
      >
        {data ? (
          <Stack gap="md">
            <SimpleGrid cols={{ base: 2, md: 4 }} spacing="sm">
              <RateCard
                title="Lead → Applicant"
                rate={data.rates.lead_to_applicant}
                scopedCaption={scopedCaption}
              />
              <RateCard
                title="Applicant → Journey"
                rate={data.rates.applicant_to_journey}
              />
              <RateCard
                title="Journey → Offer"
                rate={data.rates.journey_to_offer}
              />
              <RateCard
                title="Offer acceptance"
                rate={data.rates.offer_acceptance}
              />
            </SimpleGrid>

            <Stack gap={4}>
              <Group justify="space-between">
                <Text size="sm" fw={600}>
                  By source
                </Text>
                {scopedCaption ? (
                  <Text size="xs" c="dimmed" fs="italic">
                    {scopedCaption}
                  </Text>
                ) : null}
              </Group>
              {data.by_source.length === 0 ? (
                <Text size="sm" c="dimmed">
                  No sources with a lead in this window.
                </Text>
              ) : (
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Source</Table.Th>
                      <Table.Th>Total</Table.Th>
                      <Table.Th>Converted</Table.Th>
                      <Table.Th>In progress</Table.Th>
                      <Table.Th>Lost</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {data.by_source.map((row) => (
                      <Table.Tr key={row.source_id}>
                        <Table.Td>{row.source_name}</Table.Td>
                        <Table.Td>{row.total}</Table.Td>
                        <Table.Td>{row.converted}</Table.Td>
                        <Table.Td>{row.in_progress}</Table.Td>
                        <Table.Td>{row.lost}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}
            </Stack>
          </Stack>
        ) : null}
      </SectionState>
    </Stack>
  );
}

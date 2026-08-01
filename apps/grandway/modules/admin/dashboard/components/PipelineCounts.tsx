"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  Anchor,
  Box,
  Card,
  Grid,
  Group,
  Progress,
  Stack,
  Text,
} from "@peppermint/ui";
import { STAGE_LABELS as LEAD_STAGE_LABELS } from "@/modules/admin/lead-management/leadCategory.utils";
import {
  OFFER_STATUS_COLORS,
  OFFER_STATUS_LABELS,
} from "@/modules/admin/offers/offers.labels";
import {
  CHECKLIST_STATUS_COLORS,
  CHECKLIST_STATUS_LABELS,
} from "@/modules/admin/checklists/checklists.labels";
import { STATUS_META as DOCUMENT_STATUS_META } from "@/modules/documents/documents.status";
import {
  VERIFICATION_STATUS_COLORS,
  VERIFICATION_STATUS_LABELS,
} from "@/modules/admin/uploaded-files/uploadedFiles.labels";
import { useDashboardPipeline } from "../dashboard.hooks";
import type { DashboardFilters } from "../dashboard.types";
import { CategoryBarChart } from "./CategoryBarChart";
import { DonutStat } from "./DonutStat";
import { SectionState } from "./SectionState";

interface Datum {
  key: string;
  label: string;
  color: string;
  value: number;
}

function toData<K extends string>(
  counts: Record<K, number>,
  labels: Record<K, string>,
  colors: Record<K, string>,
): Datum[] {
  return (Object.keys(counts) as K[]).map((key) => ({
    key,
    label: labels[key],
    color: colors[key],
    value: counts[key],
  }));
}

/** Bare `{label,value}` list for a single-hue magnitude bar chart (no status color). */
function toItems<K extends string>(
  counts: Record<K, number>,
  labels: Record<K, string>,
): { label: string; value: number }[] {
  return (Object.keys(counts) as K[]).map((key) => ({
    label: labels[key],
    value: counts[key],
  }));
}

/**
 * One pipeline card: a title, a "View list" link to the OWNING app's PLAIN
 * (unfiltered) list — this app's own `?status=`/`?stage=` deep-link is unsafe
 * (`docs/AI.md`: `forceFilters` always wins, so a URL-seeded filter would lock
 * the control), and there is no drill-down contract for reproducing this
 * section's window (§9) — and the chart body.
 */
function PipelineCard({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <Card withBorder radius="lg" p="lg" h="100%">
      <Stack gap="md" h="100%">
        <Group justify="space-between" align="baseline">
          <Text fw={600} size="sm">
            {title}
          </Text>
          <Anchor component={Link} href={href} size="xs">
            View list
          </Anchor>
        </Group>
        {children}
      </Stack>
    </Card>
  );
}

/** A status breakdown ring — total in the centre, word+color+value legend below. */
function StatusDonut({
  data,
  centerLabel,
}: {
  data: Datum[];
  centerLabel: string;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <DonutStat
      items={data.map((d) => ({
        label: d.label,
        value: d.value,
        color: d.color,
      }))}
      centerValue={total}
      centerLabel={centerLabel}
    />
  );
}

/** A single full-width distribution bar (heading · total, stacked bar, legend). */
function DistributionBar({
  heading,
  data,
}: {
  heading: string;
  data: Datum[];
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <Stack gap="xs">
      <Text
        size="xs"
        fw={600}
        c="dimmed"
        tt="uppercase"
        style={{ letterSpacing: "0.06em" }}
      >
        {heading} · {total}
      </Text>
      <Progress.Root size="lg" radius="sm">
        {data.map((d) => (
          <Progress.Section
            key={d.key}
            value={total > 0 ? (d.value / total) * 100 : 0}
            color={d.color}
            title={`${d.label}: ${d.value}`}
            aria-label={`${d.label}: ${d.value}`}
          />
        ))}
      </Progress.Root>
      <Group gap="md" wrap="wrap">
        {data.map((d) => (
          <Group key={d.key} gap={6} wrap="nowrap">
            <Box
              aria-hidden
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background:
                  d.value === 0
                    ? "var(--mantine-color-gray-3)"
                    : `var(--mantine-color-${d.color}-6)`,
              }}
            />
            <Text size="xs" c={d.value === 0 ? "dimmed" : undefined}>
              {d.label} {d.value}
            </Text>
          </Group>
        ))}
      </Group>
    </Stack>
  );
}

/**
 * The zero-filled count maps windowed on CREATION date (INTEGRATION.md §7).
 * `journeys_by_stage` and `applicants_by_status` are NOT here — Overview renders
 * both as its two headline charts, and a tab must not repeat what Overview
 * already shows. Both surfaces read the one cached `pipeline` request.
 *
 * A status *breakdown* renders as a `DonutStat`; leads by stage is an ordered
 * *magnitude* so it renders as a single-hue `CategoryBarChart`; documents &
 * files stay as compact `Progress` distribution bars (heterogeneous mini-legends).
 * `documents_by_status_is_country_filtered` is always `false` and only captions
 * the panel honestly when a country filter is set elsewhere — not a real toggle.
 */
export function PipelineCounts({ filters }: { filters: DashboardFilters }) {
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardPipeline(filters);

  return (
    <SectionState
      isPending={isPending}
      isError={isError}
      errorMessage="Couldn't load pipeline counts."
      onRetry={() => refetch()}
      isRetrying={isRefetching}
      skeletonHeight={280}
    >
      {data ? (
        <Grid>
          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <PipelineCard title="Leads by stage" href="/admin/lead-management">
              <CategoryBarChart
                orientation="horizontal"
                color="brand"
                ariaLabel="Leads by stage"
                items={toItems(data.leads_by_stage, LEAD_STAGE_LABELS)}
              />
            </PipelineCard>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <PipelineCard title="Offers by status" href="/admin/offers">
              <StatusDonut
                centerLabel="offers"
                data={toData(
                  data.offers_by_status,
                  OFFER_STATUS_LABELS,
                  OFFER_STATUS_COLORS,
                )}
              />
            </PipelineCard>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <PipelineCard title="Checklists by status" href="/admin/checklists">
              <StatusDonut
                centerLabel="checklists"
                data={toData(
                  data.checklists_by_status,
                  CHECKLIST_STATUS_LABELS,
                  CHECKLIST_STATUS_COLORS,
                )}
              />
            </PipelineCard>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <PipelineCard title="Documents & files" href="/admin/documents/all">
              <Stack gap="lg">
                <DistributionBar
                  heading="Documents"
                  data={(
                    Object.keys(data.documents_by_status) as Array<
                      keyof typeof data.documents_by_status
                    >
                  ).map((key) => ({
                    key,
                    label: DOCUMENT_STATUS_META[key].label,
                    color: DOCUMENT_STATUS_META[key].color,
                    value: data.documents_by_status[key],
                  }))}
                />
                <DistributionBar
                  heading="Files"
                  data={toData(
                    data.files_by_verification,
                    VERIFICATION_STATUS_LABELS,
                    VERIFICATION_STATUS_COLORS,
                  )}
                />
              </Stack>
            </PipelineCard>
          </Grid.Col>

          {data.documents_by_status_is_country_filtered === false ? (
            <Grid.Col span={12}>
              <Text size="xs" c="dimmed">
                Documents by status is never narrowed by the country filter — a
                document belongs to an applicant, not a study destination.
              </Text>
            </Grid.Col>
          ) : null}
        </Grid>
      ) : null}
    </SectionState>
  );
}

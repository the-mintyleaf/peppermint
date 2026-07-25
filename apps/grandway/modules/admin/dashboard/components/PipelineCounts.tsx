"use client";

import Link from "next/link";
import {
  Anchor,
  Badge,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
} from "@peppermint/ui";
import {
  STAGE_COLORS as LEAD_STAGE_COLORS,
  STAGE_LABELS as LEAD_STAGE_LABELS,
} from "@/modules/admin/lead-management/leadCategory.utils";
import {
  STAGE_COLORS as JOURNEY_STAGE_COLORS,
  STAGE_LABELS as JOURNEY_STAGE_LABELS,
} from "@/modules/admin/applicant-journeys/applicantJourneys.labels";
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
import {
  APPLICANT_STATUS_COLORS,
  APPLICANT_STATUS_LABELS,
} from "../dashboard.labels";
import { SectionState } from "./SectionState";

interface CountRow {
  key: string;
  label: string;
  color: string;
  count: number;
}

function toCountRows<K extends string>(
  counts: Record<K, number>,
  labels: Record<K, string>,
  colors: Record<K, string>,
): CountRow[] {
  return (Object.keys(counts) as K[]).map((key) => ({
    key,
    label: labels[key],
    color: colors[key],
    count: counts[key],
  }));
}

/**
 * One zero-filled count map. Links to the owning app's PLAIN (unfiltered)
 * list — this app's own `?status=`/`?stage=` deep-link is documented as unsafe
 * (`docs/AI.md` "Cross-module integration": `forceFilters` always wins over a
 * column filter, so a URL-seeded filter would permanently lock the control
 * instead of just seeding it). There is also no drill-down contract for which
 * query params reproduce this section's window on the target list
 * (INTEGRATION.md §9), so a per-key filtered link would be a guess either way.
 */
function CountMapCard({
  title,
  href,
  rows,
}: {
  title: string;
  href: string;
  rows: CountRow[];
}) {
  return (
    <Card withBorder radius="md" p="md">
      <Stack gap="xs">
        <Group justify="space-between">
          <Text fw={600} size="sm">
            {title}
          </Text>
          <Anchor component={Link} href={href} size="xs">
            View list
          </Anchor>
        </Group>
        <Stack gap={4}>
          {rows.map((row) => (
            <Group key={row.key} justify="space-between" gap="xs">
              <Badge size="sm" color={row.color} variant="light">
                {row.label}
              </Badge>
              <Text size="sm" fw={600}>
                {row.count}
              </Text>
            </Group>
          ))}
        </Stack>
      </Stack>
    </Card>
  );
}

/**
 * Seven zero-filled count maps, windowed on CREATION date (INTEGRATION.md §7
 * "pipeline"). `documents_by_status_is_country_filtered` is always `false`
 * and exists only to caption the panel honestly when a country filter is set
 * elsewhere on screen — it is not a real filter toggle.
 */
export function PipelineCounts() {
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardPipeline();

  return (
    <Stack gap="sm">
      <Text fw={700}>Pipeline health</Text>
      <SectionState
        isPending={isPending}
        isError={isError}
        errorMessage="Couldn't load pipeline counts."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
        skeletonHeight={280}
      >
        {data ? (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="sm">
            <CountMapCard
              title="Leads by stage"
              href="/admin/lead-management"
              rows={toCountRows(
                data.leads_by_stage,
                LEAD_STAGE_LABELS,
                LEAD_STAGE_COLORS,
              )}
            />
            <CountMapCard
              title="Applicants by status"
              href="/admin/applicants"
              rows={toCountRows(
                data.applicants_by_status,
                APPLICANT_STATUS_LABELS,
                APPLICANT_STATUS_COLORS,
              )}
            />
            <CountMapCard
              title="Journeys by stage"
              href="/admin/applicant-journeys"
              rows={toCountRows(
                data.journeys_by_stage,
                JOURNEY_STAGE_LABELS,
                JOURNEY_STAGE_COLORS,
              )}
            />
            <CountMapCard
              title="Offers by status"
              href="/admin/offers"
              rows={toCountRows(
                data.offers_by_status,
                OFFER_STATUS_LABELS,
                OFFER_STATUS_COLORS,
              )}
            />
            <CountMapCard
              title="Checklists by status"
              href="/admin/checklists"
              rows={toCountRows(
                data.checklists_by_status,
                CHECKLIST_STATUS_LABELS,
                CHECKLIST_STATUS_COLORS,
              )}
            />
            <CountMapCard
              title="Documents by status"
              href="/admin/documents/all"
              rows={(
                Object.keys(data.documents_by_status) as Array<
                  keyof typeof data.documents_by_status
                >
              ).map((key) => ({
                key,
                label: DOCUMENT_STATUS_META[key].label,
                color: DOCUMENT_STATUS_META[key].color,
                count: data.documents_by_status[key],
              }))}
            />
            <CountMapCard
              title="Files by verification"
              href="/admin/files/review"
              rows={toCountRows(
                data.files_by_verification,
                VERIFICATION_STATUS_LABELS,
                VERIFICATION_STATUS_COLORS,
              )}
            />
          </SimpleGrid>
        ) : null}

        {data?.documents_by_status_is_country_filtered === false ? (
          <Text size="xs" c="dimmed" mt="xs">
            Documents by status is never narrowed by the country filter — a
            document belongs to an applicant, not a study destination.
          </Text>
        ) : null}
      </SectionState>
    </Stack>
  );
}

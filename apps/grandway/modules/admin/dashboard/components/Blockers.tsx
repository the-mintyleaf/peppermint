"use client";

import Link from "next/link";
import {
  Anchor,
  Badge,
  Button,
  Group,
  SimpleGrid,
  Stack,
  Text,
} from "@peppermint/ui";
import {
  ITEM_STATUS_COLORS,
  ITEM_STATUS_LABELS,
} from "@/modules/admin/checklists/checklists.labels";
import {
  STAGE_COLORS as JOURNEY_STAGE_COLORS,
  STAGE_LABELS as JOURNEY_STAGE_LABELS,
} from "@/modules/admin/applicant-journeys/applicantJourneys.labels";
import {
  FILE_CATEGORY_LABELS,
  VERIFICATION_STATUS_COLORS,
  VERIFICATION_STATUS_LABELS,
} from "@/modules/admin/uploaded-files/uploadedFiles.labels";
import { useDashboardBlockers } from "../dashboard.hooks";
import { BLOCKER_GROUP_LABELS } from "../dashboard.labels";
import { formatDate, formatDateTime } from "../dashboard.utils";
import type {
  ChecklistItemRow,
  DashboardFilters,
  FileRow,
  JourneyRow,
  OfferRow,
  PassportRow,
} from "../dashboard.types";
import { SectionState } from "./SectionState";
import { WorklistPreviewCard } from "./WorklistPreviewCard";

function BlockedChecklistItemRowView({ row }: { row: ChecklistItemRow }) {
  return (
    <Anchor
      component={Link}
      href={`/admin/checklists/${row.checklist_id}`}
      underline="never"
    >
      <Group justify="space-between" wrap="nowrap" gap="xs">
        <Stack gap={0}>
          <Text size="sm">{row.applicant_name}</Text>
          <Text size="xs" c="dimmed">
            {row.checklist_title} — {row.label}
          </Text>
        </Stack>
        <Badge size="sm" color={ITEM_STATUS_COLORS[row.status]}>
          {ITEM_STATUS_LABELS[row.status]}
        </Badge>
      </Group>
    </Anchor>
  );
}

/**
 * The safety net behind automatic checklist inheritance — an empty group is
 * the healthy state, not a missing feature (INTEGRATION.md §7). Each row
 * offers BOTH drill-throughs the concept calls for: view the journey, and
 * author the destination country's template so future journeys inherit one.
 */
function JourneyWithoutChecklistRowView({ row }: { row: JourneyRow }) {
  return (
    <Group justify="space-between" wrap="nowrap" gap="xs">
      <Stack gap={0}>
        <Text size="sm">{row.applicant_name}</Text>
        <Text size="xs" c="dimmed">
          {row.country_name || "No destination set"}
        </Text>
      </Stack>
      <Group gap="xs" wrap="nowrap">
        <Badge size="sm" color={JOURNEY_STAGE_COLORS[row.stage]}>
          {JOURNEY_STAGE_LABELS[row.stage]}
        </Badge>
        <Button
          component={Link}
          href={`/admin/applicant-journeys/${row.id}`}
          size="compact-xs"
          variant="default"
        >
          View journey
        </Button>
        <Button
          component={Link}
          href="/admin/checklists/templates"
          size="compact-xs"
          variant="light"
        >
          Author template
        </Button>
      </Group>
    </Group>
  );
}

function ExpiringPassportRowView({ row }: { row: PassportRow }) {
  return (
    <Anchor
      component={Link}
      href={`/admin/applicants/${row.applicant_id}`}
      underline="never"
    >
      <Group justify="space-between" wrap="nowrap" gap="xs">
        <Stack gap={0}>
          <Text size="sm">{row.applicant_name}</Text>
          <Text size="xs" c="dimmed">
            {row.passport_number}
          </Text>
        </Stack>
        <Stack gap={2} align="flex-end">
          <Badge size="sm" color={row.has_expired ? "red" : "orange"}>
            {row.has_expired ? "Expired" : "Expiring"}
          </Badge>
          <Text size="xs" c="dimmed">
            {formatDate(row.expiry_date, row.expiry_date_bs)}
          </Text>
        </Stack>
      </Group>
    </Anchor>
  );
}

/** Only deadlines already PAST — approaching ones live in Today's work instead. */
function OverdueOfferRowView({ row }: { row: OfferRow }) {
  return (
    <Anchor component={Link} href={`/admin/offers/${row.id}`} underline="never">
      <Group justify="space-between" wrap="nowrap" gap="xs">
        <Stack gap={0}>
          <Text size="sm">{row.applicant_name}</Text>
          <Text size="xs" c="dimmed">
            {row.institution_name} — {row.program_title}
          </Text>
        </Stack>
        <Text size="xs" c="red">
          {formatDate(row.response_deadline, row.response_deadline_bs)}
        </Text>
      </Group>
    </Anchor>
  );
}

/** Shows only files still current (already-superseded rejections are excluded). */
function RejectedFileRowView({ row }: { row: FileRow }) {
  return (
    <Anchor component={Link} href={`/admin/files/${row.id}`} underline="never">
      <Stack gap={0}>
        <Group justify="space-between" wrap="nowrap" gap="xs">
          <Text size="sm">{row.original_filename}</Text>
          <Badge size="sm" color={VERIFICATION_STATUS_COLORS.rejected}>
            {VERIFICATION_STATUS_LABELS.rejected}
          </Badge>
        </Group>
        <Text size="xs" c="dimmed">
          {FILE_CATEGORY_LABELS[row.category]} —{" "}
          {row.rejection_reason || "No reason recorded"}
        </Text>
        <Text size="xs" c="dimmed">
          Reviewed {formatDateTime(row.reviewed_at)}
        </Text>
      </Stack>
    </Anchor>
  );
}

/**
 * Five groups, GROUPED BY CAUSE, never merged into one urgency-sorted list —
 * five different people act on them (INTEGRATION.md §7 "blockers"). An empty
 * group is a healthy state, rendered neutrally, not as an error.
 */
export function Blockers({ filters }: { filters: DashboardFilters }) {
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardBlockers(filters);

  return (
    <Stack gap="sm" id="blockers">
      <Text fw={700}>Blockers and risk</Text>
      <SectionState
        isPending={isPending}
        isError={isError}
        errorMessage="Couldn't load blockers and risk."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
        skeletonHeight={320}
      >
        {data ? (
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
            <WorklistPreviewCard
              title={BLOCKER_GROUP_LABELS.blocked_checklist_items}
              preview={data.blocked_checklist_items}
              getRowKey={(row) => row.id}
              renderRow={(row) => <BlockedChecklistItemRowView row={row} />}
              emptyMessage="No blocked checklist items — healthy."
              seeAllHref="/admin/checklists"
            />
            <WorklistPreviewCard
              title={BLOCKER_GROUP_LABELS.journeys_without_a_checklist}
              preview={data.journeys_without_a_checklist}
              getRowKey={(row) => row.id}
              renderRow={(row) => <JourneyWithoutChecklistRowView row={row} />}
              emptyMessage="Every journey has a checklist — healthy."
              seeAllHref="/admin/applicant-journeys"
            />
            <WorklistPreviewCard
              title={BLOCKER_GROUP_LABELS.expiring_passports}
              preview={data.expiring_passports}
              getRowKey={(row) => row.applicant_id}
              renderRow={(row) => <ExpiringPassportRowView row={row} />}
              emptyMessage={`No passports expiring within ${data.passport_within_days} days.`}
              seeAllHref="/admin/applicants"
            />
            <WorklistPreviewCard
              title={BLOCKER_GROUP_LABELS.overdue_offers}
              preview={data.overdue_offers}
              getRowKey={(row) => row.id}
              renderRow={(row) => <OverdueOfferRowView row={row} />}
              emptyMessage="No overdue offers — healthy."
              seeAllHref="/admin/offers"
            />
            <WorklistPreviewCard
              title={BLOCKER_GROUP_LABELS.rejected_files}
              preview={data.rejected_files}
              getRowKey={(row) => row.id}
              renderRow={(row) => <RejectedFileRowView row={row} />}
              emptyMessage="No current rejected files — healthy."
              seeAllHref="/admin/files/review"
            />
          </SimpleGrid>
        ) : null}
      </SectionState>
    </Stack>
  );
}

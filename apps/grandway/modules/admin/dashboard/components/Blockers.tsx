"use client";

import Link from "next/link";
import {
  Anchor,
  Badge,
  Button,
  Card,
  Group,
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
import { PreviewTabs } from "./PreviewTabs";
import { SectionState } from "./SectionState";

function BlockedChecklistItemRowView({ row }: { row: ChecklistItemRow }) {
  return (
    <Anchor
      component={Link}
      href={`/admin/checklists/${row.checklist_id}`}
      underline="never"
      c="inherit"
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
 * The safety net behind automatic checklist inheritance — an empty group is the
 * healthy state, not a missing feature (INTEGRATION.md §7). Each row offers BOTH
 * drill-throughs the concept calls for: view the journey, and author the
 * destination country's template so future journeys inherit one.
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
      c="inherit"
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
    <Anchor
      component={Link}
      href={`/admin/offers/${row.id}`}
      underline="never"
      c="inherit"
    >
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
    <Anchor
      component={Link}
      href={`/admin/files/${row.id}`}
      underline="never"
      c="inherit"
    >
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
 * group is a healthy state, rendered neutrally, not as an error. Presented as
 * tabs; the design's per-tab reason breakdown has no backing aggregation, so the
 * honest content is the affected-rows preview.
 */
export function Blockers({ filters }: { filters: DashboardFilters }) {
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardBlockers(filters);

  return (
    <Card withBorder radius="lg" p="lg">
      <SectionState
        isPending={isPending}
        isError={isError}
        errorMessage="Couldn't load blockers and risk."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
        skeletonHeight={320}
      >
        {data ? (
          <PreviewTabs
            ariaLabel="Blockers"
            tabs={[
              {
                value: "blocked-items",
                label: BLOCKER_GROUP_LABELS.blocked_checklist_items,
                total: data.blocked_checklist_items.total,
                hasMore: data.blocked_checklist_items.has_more,
                seeAllHref: "/admin/checklists",
                emptyMessage: "No blocked checklist items — healthy.",
                rows: data.blocked_checklist_items.items.map((row) => (
                  <BlockedChecklistItemRowView key={row.id} row={row} />
                )),
              },
              {
                value: "no-checklist",
                label: BLOCKER_GROUP_LABELS.journeys_without_a_checklist,
                total: data.journeys_without_a_checklist.total,
                hasMore: data.journeys_without_a_checklist.has_more,
                seeAllHref: "/admin/applicant-journeys",
                emptyMessage: "Every journey has a checklist — healthy.",
                rows: data.journeys_without_a_checklist.items.map((row) => (
                  <JourneyWithoutChecklistRowView key={row.id} row={row} />
                )),
              },
              {
                value: "passports",
                label: BLOCKER_GROUP_LABELS.expiring_passports,
                total: data.expiring_passports.total,
                hasMore: data.expiring_passports.has_more,
                seeAllHref: "/admin/applicants",
                emptyMessage: `No passports expiring within ${data.passport_within_days} days.`,
                rows: data.expiring_passports.items.map((row) => (
                  <ExpiringPassportRowView key={row.applicant_id} row={row} />
                )),
              },
              {
                value: "overdue-offers",
                label: BLOCKER_GROUP_LABELS.overdue_offers,
                total: data.overdue_offers.total,
                hasMore: data.overdue_offers.has_more,
                seeAllHref: "/admin/offers",
                emptyMessage: "No overdue offers — healthy.",
                rows: data.overdue_offers.items.map((row) => (
                  <OverdueOfferRowView key={row.id} row={row} />
                )),
              },
              {
                value: "rejected-files",
                label: BLOCKER_GROUP_LABELS.rejected_files,
                total: data.rejected_files.total,
                hasMore: data.rejected_files.has_more,
                seeAllHref: "/admin/files/review",
                emptyMessage: "No current rejected files — healthy.",
                rows: data.rejected_files.items.map((row) => (
                  <RejectedFileRowView key={row.id} row={row} />
                )),
              },
            ]}
          />
        ) : null}
      </SectionState>
    </Card>
  );
}

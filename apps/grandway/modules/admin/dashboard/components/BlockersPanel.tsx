"use client";

import { useState } from "react";
import Link from "next/link";
import { Anchor, Badge, Button, Group, Stack, Text } from "@peppermint/ui";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
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
  DashboardBlockers,
  FileRow,
  JourneyRow,
  OfferRow,
  PassportRow,
} from "../dashboard.types";
import { PanelCard } from "./PanelCard";
import { PreviewList } from "./PreviewList";
import { SectionState } from "./SectionState";
import type { BlockersPanelProps } from "./BlockersPanel.types";

function BlockedChecklistItemRowView({ row }: { row: ChecklistItemRow }) {
  return (
    <Anchor
      component={Link}
      href={`/admin/checklists/${row.checklist_id}`}
      underline="never"
      c="inherit"
    >
      <Group justify="space-between" wrap="nowrap" gap="xs">
        <Stack gap={0} style={{ minWidth: 0 }}>
          <Text size="sm" truncate>
            {row.applicant_name}
          </Text>
          <Text size="xs" c="dimmed" truncate>
            {row.checklist_title} — {row.label}
          </Text>
        </Stack>
        <Badge
          size="xs"
          radius="sm"
          color={ITEM_STATUS_COLORS[row.status]}
          style={{ flex: "none" }}
        >
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
      <Stack gap={0} style={{ minWidth: 0 }}>
        <Text size="sm" truncate>
          {row.applicant_name}
        </Text>
        <Text size="xs" c="dimmed" truncate>
          {row.country_name || "No destination set"}
        </Text>
      </Stack>
      <Group gap="xs" wrap="nowrap" style={{ flex: "none" }}>
        <Badge size="xs" radius="sm" color={JOURNEY_STAGE_COLORS[row.stage]}>
          {JOURNEY_STAGE_LABELS[row.stage]}
        </Badge>
        <Button
          component={Link}
          href={`/admin/applicant-journeys/${row.id}`}
          size="compact-xs"
          variant="default"
        >
          View
        </Button>
        <Button
          component={Link}
          href="/admin/checklists/templates"
          size="compact-xs"
          variant="light"
        >
          Template
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
        <Stack gap={0} style={{ minWidth: 0 }}>
          <Text size="sm" truncate>
            {row.applicant_name}
          </Text>
          <Text size="xs" c="dimmed" truncate>
            {row.passport_number}
          </Text>
        </Stack>
        <Stack gap={2} align="flex-end" style={{ flex: "none" }}>
          <Badge
            size="xs"
            radius="sm"
            color={row.has_expired ? "red" : "orange"}
          >
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
        <Stack gap={0} style={{ minWidth: 0 }}>
          <Text size="sm" truncate>
            {row.applicant_name}
          </Text>
          <Text size="xs" c="dimmed" truncate>
            {row.institution_name} — {row.program_title}
          </Text>
        </Stack>
        <Text size="xs" c="red" style={{ flex: "none" }}>
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
          <Text size="sm" truncate>
            {row.original_filename}
          </Text>
          <Badge
            size="xs"
            radius="sm"
            color={VERIFICATION_STATUS_COLORS.rejected}
            style={{ flex: "none" }}
          >
            {VERIFICATION_STATUS_LABELS.rejected}
          </Badge>
        </Group>
        <Text size="xs" c="dimmed" truncate>
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

const VIEWS = [
  {
    value: "blocked_items",
    label: BLOCKER_GROUP_LABELS.blocked_checklist_items,
    description: "Someone marked them blocked and said why",
  },
  {
    value: "no_checklist",
    label: BLOCKER_GROUP_LABELS.journeys_without_a_checklist,
    description: "Inheritance did not produce one",
  },
  {
    value: "passports",
    label: BLOCKER_GROUP_LABELS.expiring_passports,
    description: "Already expired rows are included",
  },
  {
    value: "overdue_offers",
    label: BLOCKER_GROUP_LABELS.overdue_offers,
    description: "Response deadline already past",
  },
  {
    value: "rejected_files",
    label: BLOCKER_GROUP_LABELS.rejected_files,
    description: "Current rejections only",
  },
];

function blockerView(view: string, data: DashboardBlockers) {
  switch (view) {
    case "blocked_items":
      return {
        preview: data.blocked_checklist_items,
        seeAllHref: "/admin/checklists",
        emptyMessage: "No blocked checklist items — healthy.",
        rows: data.blocked_checklist_items.items.map((row) => (
          <BlockedChecklistItemRowView key={row.id} row={row} />
        )),
      };
    case "no_checklist":
      return {
        preview: data.journeys_without_a_checklist,
        seeAllHref: "/admin/applicant-journeys",
        emptyMessage: "Every journey has a checklist — healthy.",
        rows: data.journeys_without_a_checklist.items.map((row) => (
          <JourneyWithoutChecklistRowView key={row.id} row={row} />
        )),
      };
    case "passports":
      return {
        preview: data.expiring_passports,
        seeAllHref: "/admin/applicants",
        emptyMessage: `No passports expiring within ${data.passport_within_days} days.`,
        rows: data.expiring_passports.items.map((row) => (
          <ExpiringPassportRowView key={row.applicant_id} row={row} />
        )),
      };
    case "overdue_offers":
      return {
        preview: data.overdue_offers,
        seeAllHref: "/admin/offers",
        emptyMessage: "No overdue offers — healthy.",
        rows: data.overdue_offers.items.map((row) => (
          <OverdueOfferRowView key={row.id} row={row} />
        )),
      };
    default:
      return {
        preview: data.rejected_files,
        seeAllHref: "/admin/files/review",
        emptyMessage: "No current rejected files — healthy.",
        rows: data.rejected_files.items.map((row) => (
          <RejectedFileRowView key={row.id} row={row} />
        )),
      };
  }
}

/**
 * What is stuck, GROUPED BY CAUSE and never merged into one urgency-sorted list
 * — five different people act on these five groups (INTEGRATION.md §7). An empty
 * group is a healthy state and is rendered neutrally, never as an error.
 *
 * The design's per-group reason breakdown has no backing aggregation, so the
 * honest content is the affected rows themselves rather than an invented chart.
 */
export function BlockersPanel({ filters }: BlockersPanelProps) {
  const [view, setView] = useState("blocked_items");
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardBlockers(filters);

  const current = data ? blockerView(view, data) : null;
  const views = VIEWS.map((entry) => ({
    ...entry,
    count: data ? blockerView(entry.value, data).preview.total : undefined,
  }));

  return (
    <PanelCard
      title="Blockers"
      subtitle={VIEWS.find((entry) => entry.value === view)?.description}
      icon={ProhibitIcon}
      views={views}
      activeView={view}
      onViewChange={setView}
      minBodyHeight={300}
    >
      <SectionState
        isPending={isPending}
        isError={isError}
        errorMessage="Couldn't load blockers and risk."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
        skeletonHeight={300}
      >
        {current ? (
          <PreviewList
            rows={current.rows}
            total={current.preview.total}
            hasMore={current.preview.has_more}
            seeAllHref={current.seeAllHref}
            emptyMessage={current.emptyMessage}
          />
        ) : null}
      </SectionState>
    </PanelCard>
  );
}

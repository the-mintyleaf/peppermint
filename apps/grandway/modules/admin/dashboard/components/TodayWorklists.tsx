"use client";

import Link from "next/link";
import { Anchor, Badge, Group, SimpleGrid, Stack, Text } from "@peppermint/ui";
import {
  ITEM_STATUS_COLORS,
  ITEM_STATUS_LABELS,
} from "@/modules/admin/checklists/checklists.labels";
import { STATUS_META as DOCUMENT_STATUS_META } from "@/modules/documents/documents.status";
import {
  STAGE_COLORS as LEAD_STAGE_COLORS,
  STAGE_LABELS as LEAD_STAGE_LABELS,
} from "@/modules/admin/lead-management/leadCategory.utils";
import {
  FILE_CATEGORY_LABELS,
  VERIFICATION_STATUS_COLORS,
  VERIFICATION_STATUS_LABELS,
} from "@/modules/admin/uploaded-files/uploadedFiles.labels";
import { useDashboardToday } from "../dashboard.hooks";
import {
  DOCUMENT_FAMILY_LABELS,
  TODAY_WORKLIST_LABELS,
} from "../dashboard.labels";
import { formatDate, formatDateTime } from "../dashboard.utils";
import type {
  ChecklistItemRow,
  DashboardFilters,
  DocumentRow,
  FileRow,
  LeadRow,
  OfferRow,
} from "../dashboard.types";
import { SectionState } from "./SectionState";
import { WorklistPreviewCard } from "./WorklistPreviewCard";

function ChecklistItemRowView({ row }: { row: ChecklistItemRow }) {
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
        <Stack gap={2} align="flex-end">
          <Badge size="sm" color={ITEM_STATUS_COLORS[row.status]}>
            {ITEM_STATUS_LABELS[row.status]}
          </Badge>
          <Text size="xs" c="dimmed">
            {formatDate(row.due_at, row.due_at_bs)}
          </Text>
        </Stack>
      </Group>
    </Anchor>
  );
}

function OfferAwaitingResponseRowView({ row }: { row: OfferRow }) {
  return (
    <Anchor component={Link} href={`/admin/offers/${row.id}`} underline="never">
      <Group justify="space-between" wrap="nowrap" gap="xs">
        <Stack gap={0}>
          <Text size="sm">{row.applicant_name}</Text>
          <Text size="xs" c="dimmed">
            {row.institution_name} — {row.program_title}
          </Text>
        </Stack>
        <Stack gap={2} align="flex-end">
          <Badge size="sm" color={row.is_response_overdue ? "red" : "blue"}>
            {row.is_response_overdue ? "Overdue" : "Awaiting"}
          </Badge>
          <Text size="xs" c="dimmed">
            {formatDate(row.response_deadline, row.response_deadline_bs)}
          </Text>
        </Stack>
      </Group>
    </Anchor>
  );
}

/**
 * `verification_status` is a record of human judgement, NOT a gate
 * (INTEGRATION.md §7) — present as outstanding work, never as a blocker.
 */
function FileAwaitingVerificationRowView({ row }: { row: FileRow }) {
  return (
    <Anchor component={Link} href={`/admin/files/${row.id}`} underline="never">
      <Group justify="space-between" wrap="nowrap" gap="xs">
        <Stack gap={0}>
          <Text size="sm">{row.original_filename}</Text>
          <Text size="xs" c="dimmed">
            {FILE_CATEGORY_LABELS[row.category]}
          </Text>
        </Stack>
        <Stack gap={2} align="flex-end">
          <Badge
            size="sm"
            color={VERIFICATION_STATUS_COLORS[row.verification_status]}
          >
            {VERIFICATION_STATUS_LABELS[row.verification_status]}
          </Badge>
          <Text size="xs" c="dimmed">
            {formatDateTime(row.created_at)}
          </Text>
        </Stack>
      </Group>
    </Anchor>
  );
}

function DocumentInProgressRowView({ row }: { row: DocumentRow }) {
  const href = row.applicant_id
    ? `/admin/documents/workspace/${row.applicant_id}`
    : `/admin/documents/standalone/${row.id}`;
  return (
    <Anchor component={Link} href={href} underline="never">
      <Group justify="space-between" wrap="nowrap" gap="xs">
        <Stack gap={0}>
          <Text size="sm">{row.label}</Text>
          <Text size="xs" c="dimmed">
            {row.applicant_name || "Standalone document"} —{" "}
            {DOCUMENT_FAMILY_LABELS[row.family]}
          </Text>
        </Stack>
        <Stack gap={2} align="flex-end">
          <Badge size="sm" color={DOCUMENT_STATUS_META[row.status].color}>
            {DOCUMENT_STATUS_META[row.status].label}
          </Badge>
          <Text size="xs" c="dimmed">
            {formatDateTime(row.updated_at)}
          </Text>
        </Stack>
      </Group>
    </Anchor>
  );
}

/** No per-lead route exists (the board opens a lead via drawer state, not a URL) — link to the board. */
function StaleLeadRowView({ row }: { row: LeadRow }) {
  return (
    <Anchor component={Link} href="/admin/lead-management" underline="never">
      <Group justify="space-between" wrap="nowrap" gap="xs">
        <Stack gap={0}>
          <Text size="sm">{row.full_name}</Text>
          <Text size="xs" c="dimmed">
            Owner: {row.owner_display_name}
          </Text>
        </Stack>
        <Stack gap={2} align="flex-end">
          <Badge size="sm" color={LEAD_STAGE_COLORS[row.stage]}>
            {LEAD_STAGE_LABELS[row.stage]}
          </Badge>
          <Text size="xs" c="dimmed">
            {formatDateTime(row.last_followed_up_at ?? row.created_at)}
          </Text>
        </Stack>
      </Group>
    </Anchor>
  );
}

/**
 * Six Preview worklists — the worklist this module exists for
 * (INTEGRATION.md §7 "today"). `overdue_checklist_items` and
 * `due_soon_checklist_items` are disjoint, so (and ONLY so) their totals are
 * summed in the section heading below; nothing else on the page may be.
 */
export function TodayWorklists({ filters }: { filters: DashboardFilters }) {
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardToday(filters);

  return (
    <Stack gap="sm" id="today-worklists">
      <Group justify="space-between">
        <Text fw={700}>Today&apos;s work</Text>
        {data ? (
          <Text size="xs" c="dimmed">
            {data.overdue_checklist_items.total +
              data.due_soon_checklist_items.total}{" "}
            checklist items due or overdue · due-soon horizon{" "}
            {data.due_within_days} days
          </Text>
        ) : null}
      </Group>

      <SectionState
        isPending={isPending}
        isError={isError}
        errorMessage="Couldn't load today's work."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
        skeletonHeight={320}
      >
        {data ? (
          <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="sm">
            <WorklistPreviewCard
              title={TODAY_WORKLIST_LABELS.overdue_checklist_items}
              preview={data.overdue_checklist_items}
              getRowKey={(row) => row.id}
              renderRow={(row) => <ChecklistItemRowView row={row} />}
              emptyMessage="No overdue checklist items."
              seeAllHref="/admin/checklists"
            />
            <WorklistPreviewCard
              title={TODAY_WORKLIST_LABELS.due_soon_checklist_items}
              preview={data.due_soon_checklist_items}
              getRowKey={(row) => row.id}
              renderRow={(row) => <ChecklistItemRowView row={row} />}
              emptyMessage="Nothing due soon."
              seeAllHref="/admin/checklists"
            />
            <WorklistPreviewCard
              title={TODAY_WORKLIST_LABELS.offers_awaiting_response}
              preview={data.offers_awaiting_response}
              getRowKey={(row) => row.id}
              renderRow={(row) => <OfferAwaitingResponseRowView row={row} />}
              emptyMessage="No offers awaiting a response."
              seeAllHref="/admin/offers"
            />
            <WorklistPreviewCard
              title={TODAY_WORKLIST_LABELS.files_awaiting_verification}
              preview={data.files_awaiting_verification}
              getRowKey={(row) => row.id}
              renderRow={(row) => <FileAwaitingVerificationRowView row={row} />}
              emptyMessage="No files awaiting verification."
              seeAllHref="/admin/files/review"
            />
            <WorklistPreviewCard
              title={TODAY_WORKLIST_LABELS.documents_in_progress}
              preview={data.documents_in_progress}
              getRowKey={(row) => row.id}
              renderRow={(row) => <DocumentInProgressRowView row={row} />}
              emptyMessage="No documents in progress."
              caption="Ignores the country filter."
              seeAllHref="/admin/documents/all"
            />
            <WorklistPreviewCard
              title={TODAY_WORKLIST_LABELS.stale_leads}
              preview={data.stale_leads}
              getRowKey={(row) => row.id}
              renderRow={(row) => <StaleLeadRowView row={row} />}
              emptyMessage="No stale leads (7+ days without follow-up)."
              seeAllHref="/admin/lead-management"
            />
          </SimpleGrid>
        ) : null}
      </SectionState>
    </Stack>
  );
}

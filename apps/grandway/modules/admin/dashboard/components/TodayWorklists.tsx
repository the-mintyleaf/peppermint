"use client";

import Link from "next/link";
import { Anchor, Badge, Card, Group, Stack, Text } from "@peppermint/ui";
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
  DashboardFilters,
  DocumentRow,
  FileRow,
  LeadRow,
  OfferRow,
} from "../dashboard.types";
import { PreviewTabs } from "./PreviewTabs";
import { SectionState } from "./SectionState";

function OfferAwaitingResponseRowView({ row }: { row: OfferRow }) {
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
    <Anchor
      component={Link}
      href={`/admin/files/${row.id}`}
      underline="never"
      c="inherit"
    >
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
    ? `/documents/workspace/${row.applicant_id}`
    : `/documents/standalone/${row.id}`;
  return (
    <Anchor component={Link} href={href} underline="never" c="inherit">
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
    <Anchor
      component={Link}
      href="/admin/lead-management"
      underline="never"
      c="inherit"
    >
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
 * The `today` section's worklists (INTEGRATION.md §7 "today"), as tabs.
 *
 * FOUR of the six render here: `overdue_checklist_items` and
 * `due_soon_checklist_items` live on Overview as full preview lists, and a tab
 * must not repeat what Overview already shows. The section still issues the one
 * `today` request, so both surfaces read the same cached payload.
 */
export function TodayWorklists({ filters }: { filters: DashboardFilters }) {
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardToday(filters);

  return (
    <Card withBorder radius="lg" p="lg">
      <SectionState
        isPending={isPending}
        isError={isError}
        errorMessage="Couldn't load today's work."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
        skeletonHeight={320}
      >
        {data ? (
          <Stack gap="md">
            <Group justify="flex-end">
              <Text size="xs" c="dimmed">
                Overdue and due-soon checklist items are on Overview · due-soon
                horizon {data.due_within_days} days
              </Text>
            </Group>
            <PreviewTabs
              ariaLabel="Today's worklists"
              tabs={[
                {
                  value: "offers",
                  label: TODAY_WORKLIST_LABELS.offers_awaiting_response,
                  total: data.offers_awaiting_response.total,
                  hasMore: data.offers_awaiting_response.has_more,
                  seeAllHref: "/admin/offers",
                  emptyMessage: "No offers awaiting a response.",
                  rows: data.offers_awaiting_response.items.map((row) => (
                    <OfferAwaitingResponseRowView key={row.id} row={row} />
                  )),
                },
                {
                  value: "files",
                  label: TODAY_WORKLIST_LABELS.files_awaiting_verification,
                  total: data.files_awaiting_verification.total,
                  hasMore: data.files_awaiting_verification.has_more,
                  seeAllHref: "/admin/files/review",
                  emptyMessage: "No files awaiting verification.",
                  rows: data.files_awaiting_verification.items.map((row) => (
                    <FileAwaitingVerificationRowView key={row.id} row={row} />
                  )),
                },
                {
                  value: "documents",
                  label: TODAY_WORKLIST_LABELS.documents_in_progress,
                  total: data.documents_in_progress.total,
                  hasMore: data.documents_in_progress.has_more,
                  seeAllHref: "/admin/documents/all",
                  emptyMessage: "No documents in progress.",
                  caption: "Ignores the country filter.",
                  rows: data.documents_in_progress.items.map((row) => (
                    <DocumentInProgressRowView key={row.id} row={row} />
                  )),
                },
                {
                  value: "stale-leads",
                  label: TODAY_WORKLIST_LABELS.stale_leads,
                  total: data.stale_leads.total,
                  hasMore: data.stale_leads.has_more,
                  seeAllHref: "/admin/lead-management",
                  emptyMessage: "No stale leads (7+ days without follow-up).",
                  rows: data.stale_leads.items.map((row) => (
                    <StaleLeadRowView key={row.id} row={row} />
                  )),
                },
              ]}
            />
          </Stack>
        ) : null}
      </SectionState>
    </Card>
  );
}

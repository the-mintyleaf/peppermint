"use client";

import { useState } from "react";
import Link from "next/link";
import { Anchor, Badge, Group, Stack, Text } from "@peppermint/ui";
import { SunHorizonIcon } from "@phosphor-icons/react/dist/csr/SunHorizon";
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
  DashboardToday,
  DocumentRow,
  FileRow,
  LeadRow,
  OfferRow,
} from "../dashboard.types";
import { ChecklistItemRowView } from "./ChecklistItemRowView";
import { PanelCard } from "./PanelCard";
import { PreviewList } from "./PreviewList";
import { SectionState } from "./SectionState";
import type { TodayPanelProps } from "./TodayPanel.types";

function OfferAwaitingResponseRowView({ row }: { row: OfferRow }) {
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
        <Stack gap={2} align="flex-end" style={{ flex: "none" }}>
          <Badge
            size="xs"
            radius="sm"
            color={row.is_response_overdue ? "red" : "blue"}
          >
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
        <Stack gap={0} style={{ minWidth: 0 }}>
          <Text size="sm" truncate>
            {row.original_filename}
          </Text>
          <Text size="xs" c="dimmed" truncate>
            {FILE_CATEGORY_LABELS[row.category]}
          </Text>
        </Stack>
        <Stack gap={2} align="flex-end" style={{ flex: "none" }}>
          <Badge
            size="xs"
            radius="sm"
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
        <Stack gap={0} style={{ minWidth: 0 }}>
          <Text size="sm" truncate>
            {row.label}
          </Text>
          <Text size="xs" c="dimmed" truncate>
            {row.applicant_name || "Standalone document"} —{" "}
            {DOCUMENT_FAMILY_LABELS[row.family]}
          </Text>
        </Stack>
        <Stack gap={2} align="flex-end" style={{ flex: "none" }}>
          <Badge
            size="xs"
            radius="sm"
            color={DOCUMENT_STATUS_META[row.status].color}
          >
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
        <Stack gap={0} style={{ minWidth: 0 }}>
          <Text size="sm" truncate>
            {row.full_name}
          </Text>
          <Text size="xs" c="dimmed" truncate>
            Owner: {row.owner_display_name}
          </Text>
        </Stack>
        <Stack gap={2} align="flex-end" style={{ flex: "none" }}>
          <Badge size="xs" radius="sm" color={LEAD_STAGE_COLORS[row.stage]}>
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

const VIEWS = [
  {
    value: "overdue",
    label: TODAY_WORKLIST_LABELS.overdue_checklist_items,
    description:
      "Past their due date — the server decides overdue, not the browser",
  },
  {
    value: "due_soon",
    label: TODAY_WORKLIST_LABELS.due_soon_checklist_items,
    description: "Inside the due-soon horizon",
  },
  {
    value: "offers",
    label: TODAY_WORKLIST_LABELS.offers_awaiting_response,
    description: "Issued, no decision recorded yet",
  },
  {
    value: "files",
    label: TODAY_WORKLIST_LABELS.files_awaiting_verification,
    description: "Uploaded, nobody has judged them yet",
  },
  {
    value: "documents",
    label: TODAY_WORKLIST_LABELS.documents_in_progress,
    description: "Drafted, not yet ready",
  },
  {
    value: "stale_leads",
    label: TODAY_WORKLIST_LABELS.stale_leads,
    description: "The backend's own staleness window",
  },
];

/** Each view is one `Preview<T>` off the ONE `today` request — same payload, six questions. */
function todayView(view: string, data: DashboardToday) {
  switch (view) {
    case "overdue":
      return {
        preview: data.overdue_checklist_items,
        seeAllHref: "/admin/checklists",
        emptyMessage: "Nothing overdue — healthy.",
        rows: data.overdue_checklist_items.items.map((row) => (
          <ChecklistItemRowView key={row.id} row={row} />
        )),
      };
    case "due_soon":
      return {
        preview: data.due_soon_checklist_items,
        seeAllHref: "/admin/checklists",
        emptyMessage: `Nothing due in the next ${data.due_within_days} days.`,
        rows: data.due_soon_checklist_items.items.map((row) => (
          <ChecklistItemRowView key={row.id} row={row} />
        )),
      };
    case "offers":
      return {
        preview: data.offers_awaiting_response,
        seeAllHref: "/admin/offers",
        emptyMessage: "No offers awaiting a response.",
        rows: data.offers_awaiting_response.items.map((row) => (
          <OfferAwaitingResponseRowView key={row.id} row={row} />
        )),
      };
    case "files":
      return {
        preview: data.files_awaiting_verification,
        seeAllHref: "/admin/files/review",
        emptyMessage: "No files awaiting verification.",
        rows: data.files_awaiting_verification.items.map((row) => (
          <FileAwaitingVerificationRowView key={row.id} row={row} />
        )),
      };
    case "documents":
      return {
        preview: data.documents_in_progress,
        seeAllHref: "/admin/documents/all",
        emptyMessage: "No documents in progress.",
        caption: "Ignores the country filter.",
        rows: data.documents_in_progress.items.map((row) => (
          <DocumentInProgressRowView key={row.id} row={row} />
        )),
      };
    default:
      return {
        preview: data.stale_leads,
        seeAllHref: "/admin/lead-management",
        emptyMessage: "No stale leads.",
        rows: data.stale_leads.items.map((row) => (
          <StaleLeadRowView key={row.id} row={row} />
        )),
      };
  }
}

/**
 * What has to happen today. All six worklists come from the ONE `today` request,
 * so the counts in the menu are consistent with each other and with whichever
 * queue is open.
 *
 * The "stale leads" queue here is the BACKEND's staleness window, which is a
 * different question from the leads band's client-side "needs attention"
 * category above — same subject, two definitions, so both say which they are
 * rather than quietly disagreeing.
 */
export function TodayPanel({ filters }: TodayPanelProps) {
  const [view, setView] = useState("overdue");
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardToday(filters);

  const current = data ? todayView(view, data) : null;
  const views = VIEWS.map((entry) => ({
    ...entry,
    count: data ? todayView(entry.value, data).preview.total : undefined,
  }));

  return (
    <PanelCard
      title="Today's work"
      subtitle={VIEWS.find((entry) => entry.value === view)?.description}
      icon={SunHorizonIcon}
      views={views}
      activeView={view}
      onViewChange={setView}
      minBodyHeight={300}
    >
      <SectionState
        isPending={isPending}
        isError={isError}
        errorMessage="Couldn't load today's work."
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
            caption={current.caption}
          />
        ) : null}
      </SectionState>
    </PanelCard>
  );
}

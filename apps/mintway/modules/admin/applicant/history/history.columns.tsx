"use client";

import { Badge, Stack, Text, dayjs } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";

import { ENGAGEMENT_STATUS_LABELS, LIFECYCLE_STAGE_LABELS } from "../_shared";
import type {
  EngagementStatus,
  LifecycleHistoryEntry,
  LifecycleStage,
  LockHistoryEntry,
  MergeRecord,
} from "../_shared";

function fmtDateTime(value?: string | null) {
  if (!value) return "—";
  const d = dayjs(value);
  return d.isValid() ? d.format("MMM D, YYYY · h:mm A") : "—";
}

function stageLabel(v?: LifecycleStage | "") {
  return v ? (LIFECYCLE_STAGE_LABELS[v] ?? v) : "—";
}
function engagementLabel(v?: EngagementStatus | "") {
  return v ? (ENGAGEMENT_STATUS_LABELS[v] ?? v) : "—";
}

export const lifecycleHistoryColumns: DataTableShellColumn<LifecycleHistoryEntry>[] =
  [
    {
      accessor: "change",
      title: "Change",
      render: (e) => (
        <Stack gap={2}>
          {(e.from_stage || e.into_stage) && (
            <Text size="xs">
              Stage: {stageLabel(e.from_stage)} → {stageLabel(e.into_stage)}
            </Text>
          )}
          {(e.from_engagement_status || e.into_engagement_status) && (
            <Text size="xs">
              Engagement: {engagementLabel(e.from_engagement_status)} →{" "}
              {engagementLabel(e.into_engagement_status)}
            </Text>
          )}
        </Stack>
      ),
    },
    {
      accessor: "reason",
      title: "Reason",
      render: (e) => (
        <Text size="xs" lineClamp={2}>
          {e.reason || "—"}
        </Text>
      ),
    },
    {
      accessor: "created_at",
      title: "When",
      render: (e) => <Text size="xs">{fmtDateTime(e.created_at)}</Text>,
    },
  ];

export const lockHistoryColumns: DataTableShellColumn<LockHistoryEntry>[] = [
  {
    accessor: "action",
    title: "Action",
    render: (e) => (
      <Badge variant="light" color={e.action === "locked" ? "orange" : "teal"}>
        {e.action === "locked" ? "Locked" : "Unlocked"}
      </Badge>
    ),
  },
  {
    accessor: "reason",
    title: "Reason",
    render: (e) => (
      <Text size="xs" lineClamp={2}>
        {e.reason || "—"}
      </Text>
    ),
  },
  {
    accessor: "created_at",
    title: "When",
    render: (e) => <Text size="xs">{fmtDateTime(e.created_at)}</Text>,
  },
];

export const mergeHistoryColumns: DataTableShellColumn<MergeRecord>[] = [
  {
    accessor: "direction",
    title: "Merge",
    render: (e) => (
      <Text size="xs">
        {e.source_applicant} → {e.surviving_applicant}
      </Text>
    ),
  },
  {
    accessor: "reason",
    title: "Reason",
    render: (e) => (
      <Text size="xs" lineClamp={2}>
        {e.reason || "—"}
      </Text>
    ),
  },
  {
    accessor: "created_at",
    title: "When",
    render: (e) => <Text size="xs">{fmtDateTime(e.created_at)}</Text>,
  },
];

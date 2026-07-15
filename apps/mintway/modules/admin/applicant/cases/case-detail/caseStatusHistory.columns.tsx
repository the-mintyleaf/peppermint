"use client";

import { Text, dayjs } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";

import { CASE_STATUS_LABELS } from "../../_shared";
import type {
  ApplicationCaseStatusHistoryEntry,
  CaseStatus,
} from "../../_shared";

function label(v?: CaseStatus | "") {
  return v ? (CASE_STATUS_LABELS[v] ?? v) : "—";
}
function fmtDateTime(value?: string | null) {
  if (!value) return "—";
  const d = dayjs(value);
  return d.isValid() ? d.format("MMM D, YYYY · h:mm A") : "—";
}

export const caseStatusHistoryColumns: DataTableShellColumn<ApplicationCaseStatusHistoryEntry>[] =
  [
    {
      accessor: "change",
      title: "Change",
      render: (e) => (
        <Text size="xs">
          {label(e.from_status)} → {label(e.into_status)}
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

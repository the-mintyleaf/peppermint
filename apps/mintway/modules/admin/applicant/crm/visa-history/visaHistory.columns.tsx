"use client";

import { Text } from "@peppermint/ui";
import { StatusBadge } from "@peppermint/admin";
import type { DataTableShellColumn } from "@peppermint/admin";

import { VISA_DECISION_COLORS, VISA_DECISION_LABELS } from "../../_shared";
import type { VisaDecision, VisaHistory } from "../../_shared";

export const visaHistoryColumns: DataTableShellColumn<VisaHistory>[] = [
  {
    accessor: "country",
    title: "Country",
    render: (v) => (
      <Text size="xs" fw={500}>
        {v.country || "—"}
      </Text>
    ),
  },
  {
    accessor: "visa_type",
    title: "Visa type",
    render: (v) => <Text size="xs">{v.visa_type || "—"}</Text>,
  },
  {
    accessor: "decision",
    title: "Decision",
    render: (v) =>
      v.decision ? (
        <StatusBadge<VisaDecision>
          value={v.decision}
          colorMap={VISA_DECISION_COLORS}
          labelMap={VISA_DECISION_LABELS}
        />
      ) : (
        <Text size="xs" c="dimmed">
          —
        </Text>
      ),
  },
];

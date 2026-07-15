"use client";

import { Text, dayjs } from "@peppermint/ui";
import { StatusBadge } from "@peppermint/admin";
import type { DataTableShellColumn } from "@peppermint/admin";

import {
  CONSENT_STATUS_COLORS,
  CONSENT_STATUS_LABELS,
  CONSENT_TYPE_LABELS,
} from "../../_shared";
import type { Consent, ConsentStatus } from "../../_shared";

function fmtDateTime(value?: string | null) {
  if (!value) return "—";
  const d = dayjs(value);
  return d.isValid() ? d.format("MMM D, YYYY h:mm A") : "—";
}

export const consentColumns: DataTableShellColumn<Consent>[] = [
  {
    accessor: "consent_type",
    title: "Type",
    render: (c) => (
      <Text size="xs" fw={500}>
        {CONSENT_TYPE_LABELS[c.consent_type] ?? c.consent_type}
      </Text>
    ),
  },
  {
    accessor: "status",
    title: "Status",
    render: (c) => (
      <StatusBadge<ConsentStatus>
        value={c.status}
        colorMap={CONSENT_STATUS_COLORS}
        labelMap={CONSENT_STATUS_LABELS}
      />
    ),
  },
  {
    accessor: "captured_at",
    title: "Captured",
    render: (c) => <Text size="xs">{fmtDateTime(c.captured_at)}</Text>,
  },
];

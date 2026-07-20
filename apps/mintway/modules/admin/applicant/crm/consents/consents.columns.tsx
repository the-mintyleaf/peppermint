"use client";

import { Text } from "@peppermint/ui";
import { StatusBadge } from "@peppermint/admin";
import type { DataTableShellColumn } from "@peppermint/admin";

import {
  CONSENT_STATUS_COLORS,
  CONSENT_STATUS_LABELS,
  CONSENT_TYPE_LABELS,
  bsDateColumn,
} from "../../_shared";
import type { Consent, ConsentStatus } from "../../_shared";

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
  bsDateColumn<Consent>("captured_at", "Captured", { withTime: true }),
];

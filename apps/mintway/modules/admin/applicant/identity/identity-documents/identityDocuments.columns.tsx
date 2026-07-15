"use client";

import { Text, dayjs } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import { StatusBadge } from "@peppermint/admin";

import {
  IDENTITY_DOCUMENT_TYPE_LABELS,
  VERIFICATION_STATUS_COLORS,
  VERIFICATION_STATUS_LABELS,
} from "../../_shared";
import type { IdentityDocument, VerificationStatus } from "../../_shared";

function fmtDate(value?: string | null) {
  if (!value) return "—";
  const d = dayjs(value);
  return d.isValid() ? d.format("MMM D, YYYY") : "—";
}

export const identityDocumentColumns: DataTableShellColumn<IdentityDocument>[] =
  [
    {
      accessor: "document_type",
      title: "Type",
      render: (d) => (
        <Text size="xs" fw={500}>
          {IDENTITY_DOCUMENT_TYPE_LABELS[d.document_type] ?? d.document_type}
        </Text>
      ),
    },
    {
      accessor: "issuing_country",
      title: "Issuing country",
      render: (d) => <Text size="xs">{d.issuing_country || "—"}</Text>,
    },
    {
      accessor: "expires_at",
      title: "Expires",
      render: (d) => <Text size="xs">{fmtDate(d.expires_at)}</Text>,
    },
    {
      accessor: "verification_status",
      title: "Verification",
      render: (d) =>
        d.verification_status ? (
          <StatusBadge<VerificationStatus>
            value={d.verification_status}
            colorMap={VERIFICATION_STATUS_COLORS}
            labelMap={VERIFICATION_STATUS_LABELS}
          />
        ) : (
          <Text size="xs" c="dimmed">
            —
          </Text>
        ),
    },
  ];

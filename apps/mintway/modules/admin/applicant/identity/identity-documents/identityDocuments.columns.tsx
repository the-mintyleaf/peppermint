"use client";

import { Text } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import { StatusBadge } from "@peppermint/admin";

import {
  IDENTITY_DOCUMENT_TYPE_LABELS,
  VERIFICATION_STATUS_COLORS,
  VERIFICATION_STATUS_LABELS,
  bsDateColumn,
} from "../../_shared";
import type { IdentityDocument, VerificationStatus } from "../../_shared";

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
    bsDateColumn<IdentityDocument>("expires_at", "Expires"),
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

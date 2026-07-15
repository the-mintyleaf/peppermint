"use client";

import { Badge, Text } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";

import { SPONSOR_TYPE_LABELS } from "../../_shared";
import type { Sponsor } from "../../_shared";

function fundingAmount(s: Sponsor): string {
  if (!s.funding_amount) return "—";
  return [s.funding_amount, s.funding_amount_currency]
    .filter(Boolean)
    .join(" ");
}

export const sponsorColumns: DataTableShellColumn<Sponsor>[] = [
  {
    accessor: "sponsor_type",
    title: "Type",
    render: (s) => (
      <Text size="xs" fw={500}>
        {SPONSOR_TYPE_LABELS[s.sponsor_type] ?? s.sponsor_type}
      </Text>
    ),
  },
  {
    accessor: "name",
    title: "Name",
    render: (s) => <Text size="xs">{s.name || "—"}</Text>,
  },
  {
    accessor: "funding_amount",
    title: "Funding amount",
    render: (s) => <Text size="xs">{fundingAmount(s)}</Text>,
  },
  {
    accessor: "is_primary",
    title: "Primary",
    render: (s) =>
      s.is_primary ? (
        <Badge variant="light" color="teal">
          Primary
        </Badge>
      ) : (
        <Text size="xs" c="dimmed">
          —
        </Text>
      ),
  },
];

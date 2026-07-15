"use client";

import { Badge, Stack, Text } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";

import { ADDRESS_TYPE_LABELS } from "../_shared";
import type { Address } from "../_shared";

function locationLine(a: Address): string {
  const parts = [
    a.street,
    a.locality,
    a.municipality,
    a.district,
    a.province_or_state,
    a.country,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : (a.address_text ?? "—");
}

export const addressColumns: DataTableShellColumn<Address>[] = [
  {
    accessor: "address_type",
    title: "Type",
    render: (a) => (
      <Badge variant="light" color="gray">
        {ADDRESS_TYPE_LABELS[a.address_type] ?? a.address_type}
      </Badge>
    ),
  },
  {
    accessor: "location",
    title: "Address",
    render: (a) => (
      <Text size="xs" lineClamp={2}>
        {locationLine(a)}
      </Text>
    ),
  },
  {
    accessor: "is_primary",
    title: "Primary",
    render: (a) =>
      a.is_primary ? (
        <Badge variant="light" color="teal">
          Primary
        </Badge>
      ) : (
        <Text size="xs" c="dimmed">
          —
        </Text>
      ),
  },
  {
    accessor: "postal_code",
    title: "Postal code",
    render: (a) => (
      <Stack gap={0}>
        <Text size="xs">{a.postal_code || "—"}</Text>
      </Stack>
    ),
  },
];

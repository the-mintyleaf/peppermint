"use client";

import { Badge, Text } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";

import type { FamilyMember } from "../../_shared";

export const familyMemberColumns: DataTableShellColumn<FamilyMember>[] = [
  {
    accessor: "name",
    title: "Name",
    render: (m) => <Text size="xs">{m.name || "—"}</Text>,
  },
  {
    accessor: "relationship",
    title: "Relationship",
    render: (m) => <Text size="xs">{m.relationship || "—"}</Text>,
  },
  {
    accessor: "is_financial_sponsor",
    title: "Financial sponsor",
    render: (m) =>
      m.is_financial_sponsor ? (
        <Badge variant="light" color="teal">
          Yes
        </Badge>
      ) : (
        <Text size="xs" c="dimmed">
          —
        </Text>
      ),
  },
  {
    accessor: "occupation",
    title: "Occupation",
    render: (m) => <Text size="xs">{m.occupation || "—"}</Text>,
  },
];

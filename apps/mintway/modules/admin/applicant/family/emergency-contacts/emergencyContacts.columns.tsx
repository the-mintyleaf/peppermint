"use client";

import { Badge, Text } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";

import type { EmergencyContact } from "../../_shared";

export const emergencyContactColumns: DataTableShellColumn<EmergencyContact>[] =
  [
    {
      accessor: "name",
      title: "Name",
      render: (c) => <Text size="xs">{c.name || "—"}</Text>,
    },
    {
      accessor: "relationship",
      title: "Relationship",
      render: (c) => <Text size="xs">{c.relationship || "—"}</Text>,
    },
    {
      accessor: "phone",
      title: "Phone",
      render: (c) => <Text size="xs">{c.phone || "—"}</Text>,
    },
    {
      accessor: "is_primary",
      title: "Primary",
      render: (c) =>
        c.is_primary ? (
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

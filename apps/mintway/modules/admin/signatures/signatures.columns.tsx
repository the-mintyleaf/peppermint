"use client";

import { Badge, Button, Group } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import type { Signature } from "@/modules/documents";

interface SignatureColumnHandlers {
  onEdit: (signature: Signature) => void;
  onDeactivate: (id: string) => void;
  deactivatingId: string | null;
}

export function getSignaturesColumns({
  onEdit,
  onDeactivate,
  deactivatingId,
}: SignatureColumnHandlers): DataTableShellColumn<Signature>[] {
  return [
    { accessor: "name", title: "Name", sortable: true, width: "24%" },
    {
      accessor: "title",
      title: "Title",
      sortable: false,
      width: "20%",
      render: (r) => r.title || "—",
    },
    {
      accessor: "organization",
      title: "Organization",
      sortable: false,
      width: "20%",
      render: (r) => r.organization || "—",
    },
    {
      accessor: "is_active",
      title: "Status",
      sortable: false,
      width: "12%",
      render: (r) => (
        <Badge size="xs" variant="light" color={r.is_active ? "green" : "gray"}>
          {r.is_active ? "active" : "inactive"}
        </Badge>
      ),
    },
    {
      accessor: "has_image",
      title: "Image",
      sortable: false,
      width: "10%",
      render: (r) => (r.has_image ? "Yes" : "—"),
    },
    {
      accessor: "actions",
      title: "Actions",
      sortable: false,
      width: "14%",
      render: (r) => (
        <Group gap={4} wrap="nowrap">
          <Button size="compact-xs" variant="subtle" onClick={() => onEdit(r)}>
            Edit
          </Button>
          {r.is_active && (
            <Button
              size="compact-xs"
              variant="subtle"
              color="red"
              loading={deactivatingId === r.id}
              onClick={() => onDeactivate(r.id)}
            >
              Deactivate
            </Button>
          )}
        </Group>
      ),
    },
  ];
}

"use client";

import { Text } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import type { Signature } from "@/modules/documents";
import { SignatureRowActionsMenu } from "./components/SignatureRowActionsMenu";
import { SignatureStatusCell } from "./components/SignatureStatusCell";

export const signaturesColumns: DataTableShellColumn<Signature>[] = [
  { accessor: "name", title: "Name", sortable: true },
  {
    accessor: "title",
    title: "Title",
    render: (r) => <Text size="xs">{r.title || "—"}</Text>,
  },
  {
    accessor: "organization",
    title: "Organization",
    render: (r) => <Text size="xs">{r.organization || "—"}</Text>,
  },
  {
    accessor: "is_active",
    title: "Status",
    render: (r) => <SignatureStatusCell signature={r} />,
  },
  {
    accessor: "has_image",
    title: "Image",
    render: (r) => <Text size="xs">{r.has_image ? "Yes" : "—"}</Text>,
  },
  {
    accessor: "actions",
    title: "",
    textAlign: "right",
    render: (r) => <SignatureRowActionsMenu signature={r} />,
  },
];

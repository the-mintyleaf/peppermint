"use client";

import { Text } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";

import type { Reference } from "../../_shared";

function titleInstitution(r: Reference): string {
  const parts = [r.title, r.institution].filter(Boolean);
  return parts.length ? parts.join(" · ") : "—";
}

export const referenceColumns: DataTableShellColumn<Reference>[] = [
  {
    accessor: "name",
    title: "Name",
    render: (r) => <Text size="xs">{r.name || "—"}</Text>,
  },
  {
    accessor: "title_institution",
    title: "Title / institution",
    render: (r) => (
      <Text size="xs" lineClamp={2}>
        {titleInstitution(r)}
      </Text>
    ),
  },
  {
    accessor: "relationship_to_applicant",
    title: "Relationship",
    render: (r) => <Text size="xs">{r.relationship_to_applicant || "—"}</Text>,
  },
  {
    accessor: "contact",
    title: "Contact",
    render: (r) => <Text size="xs">{r.contact || r.email || "—"}</Text>,
  },
];

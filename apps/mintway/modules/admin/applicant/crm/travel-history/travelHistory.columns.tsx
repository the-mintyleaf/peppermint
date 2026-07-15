"use client";

import { Text, dayjs } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";

import type { TravelHistory } from "../../_shared";

function fmtDate(value?: string | null) {
  if (!value) return "—";
  const d = dayjs(value);
  return d.isValid() ? d.format("MMM D, YYYY") : "—";
}

export const travelHistoryColumns: DataTableShellColumn<TravelHistory>[] = [
  {
    accessor: "country",
    title: "Country",
    render: (t) => (
      <Text size="xs" fw={500}>
        {t.country || "—"}
      </Text>
    ),
  },
  {
    accessor: "purpose",
    title: "Purpose",
    render: (t) => <Text size="xs">{t.purpose || "—"}</Text>,
  },
  {
    accessor: "travelled_from",
    title: "From",
    render: (t) => <Text size="xs">{fmtDate(t.travelled_from)}</Text>,
  },
  {
    accessor: "travelled_to",
    title: "To",
    render: (t) => <Text size="xs">{fmtDate(t.travelled_to)}</Text>,
  },
];

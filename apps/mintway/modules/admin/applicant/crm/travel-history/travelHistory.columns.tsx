"use client";

import { Text } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";

import { bsDateColumn } from "../../_shared";
import type { TravelHistory } from "../../_shared";

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
  bsDateColumn<TravelHistory>("travelled_from", "From"),
  bsDateColumn<TravelHistory>("travelled_to", "To"),
];

import type { DataTableShellColumn } from "@peppermint/admin";
import { Badge, Text } from "@peppermint/ui";
import type { CompetitorRow } from "../../competitors.types";

export const competitorsColumns: DataTableShellColumn<CompetitorRow>[] = [
  {
    accessor: "handle",
    title: "Handle",
    sortable: true,
    render: (record) => (
      <Text size="xs" fw={500}>{record.handle}</Text>
    ),
  },
  {
    accessor: "platform",
    title: "Platform",
    render: (record) => (
      <Badge size="xs" variant="light">{record.platform}</Badge>
    ),
    width: 110,
  },
  {
    accessor: "volumeSeries",
    title: "Today",
    render: (record) => (
      record.volumeSeries[record.volumeSeries.length - 1]?.value ?? 0
    ),
    width: 80,
  },
];

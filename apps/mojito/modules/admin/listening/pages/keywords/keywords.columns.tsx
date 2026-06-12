import type { DataTableShellColumn } from "@zetsel/admin";
import { Badge, Text } from "@zetsel/ui";
import type { KeywordRow } from "../../keywords.types";

export const keywordsColumns: DataTableShellColumn<KeywordRow>[] = [
  {
    accessor: "term",
    title: "Term",
    sortable: true,
    render: (record) => (
      <Text size="xs" fw={500}>{record.term}</Text>
    ),
  },
  {
    accessor: "kind",
    title: "Kind",
    render: (record) => (
      <Badge size="xs" variant="light" color={record.kind === "hashtag" ? "violet" : "blue"}>
        {record.kind}
      </Badge>
    ),
    width: 100,
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

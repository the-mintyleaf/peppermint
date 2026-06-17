import { Badge } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import type { Book, BookStatus } from "../../books.types";

const statusColor: Record<BookStatus, string> = {
  available: "green",
  "checked-out": "orange",
  reserved: "blue",
};

export const booksColumns: DataTableShellColumn<Book>[] = [
  { accessor: "title",         title: "Title",          sortable: true },
  { accessor: "author",        title: "Author",         sortable: true },
  { accessor: "genre",         title: "Genre",          sortable: true },
  { accessor: "isbn",          title: "ISBN" },
  { accessor: "publishedYear", title: "Published",      sortable: true },
  {
    accessor: "status",
    title: "Status",
    render: (record) => (
      <Badge size="xs" color={statusColor[record.status as BookStatus]}>
        {record.status}
      </Badge>
    ),
  },
];

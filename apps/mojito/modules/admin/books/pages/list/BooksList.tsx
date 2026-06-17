"use client";

import { ModalTableShell } from "@peppermint/admin";
import { Paper } from "@peppermint/ui";
import type { DataTableShellTab } from "@peppermint/admin";
import { BooksIcon }       from "@phosphor-icons/react/dist/csr/Books";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { ClockIcon }       from "@phosphor-icons/react/dist/csr/Clock";
import { BookmarkIcon }    from "@phosphor-icons/react/dist/csr/Bookmark";
import { fetchBooks, createBook, updateBook, deleteBook } from "../../books.api";
import { booksColumns } from "./books.columns";
import { bookQueryKeys } from "../../books.queryKeys";
import { BookForm } from "../../form/BookForm";
import type { Book } from "../../books.types";

const tabs: DataTableShellTab[] = [
  { label: "All Books",   icon: BooksIcon },
  { label: "Available",   icon: CheckCircleIcon, filter: { status: "available" } },
  { label: "Checked Out", icon: ClockIcon,        filter: { status: "checked-out" } },
  { label: "Reserved",    icon: BookmarkIcon,     filter: { status: "reserved" } },
];

export function BooksList() {
  return (
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)">
      <ModalTableShell<Book>
        queryKey={bookQueryKeys.list()}
        queryGetFn={fetchBooks}
        dataKey="data"
        paginationKey="meta"
        columns={booksColumns}
        moduleInfo={{
          name: "books",
          label: "Books",
          description: "Manage the library book catalogue",
        }}
        idAccessor="id"
        createFormComponent={BookForm}
        editFormComponent={BookForm}
        onCreateApi={(values) => createBook(values)}
        onEditApi={(values) => updateBook(values.id, values)}
        onDeleteApi={(id) => deleteBook(String(id))}
        pageSizes={[10, 20, 30, 50]}
        defaultPageSize={20}
        tabs={tabs}
        basePath="/admin/books"
      />
    </Paper>
  );
}

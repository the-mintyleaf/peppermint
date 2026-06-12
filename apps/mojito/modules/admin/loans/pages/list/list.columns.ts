import type { DataTableShellColumn } from "@zetsel/admin";
import type { Loan } from "../../module.api";

export const LOAN_COLUMNS: DataTableShellColumn<Loan>[] = [
  { accessor: "memberName", title: "Member",  key: "member",  sortable: true, width: 200 },
  { accessor: "bookTitle",  title: "Book",    key: "book",    sortable: true, width: 240 },
  { accessor: "loanDate",   title: "Loaned",  key: "loaned",  sortable: true, width: 120 },
  { accessor: "dueDate",    title: "Due",     key: "due",     sortable: true, width: 120 },
  { accessor: "returnDate", title: "Returned",key: "returned",               width: 120 },
  { accessor: "status",     title: "Status",  key: "status",                 width: 110 },
];

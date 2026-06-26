import type { DataTableShellColumn } from "@peppermint/admin";
import type { Automation } from "../../module.api";

// Columns are defined here; custom renders for status, run summary, and actions
// are injected via the DataTableShell's render prop in index.tsx since they
// require hooks (useRouter, useMutation) that can't run outside a component.
export const AUTOMATION_COLUMNS: DataTableShellColumn<Automation>[] = [
  {
    accessor: "name",
    title: "Automation",
    key: "name",
    sortable: true,
    width: 240,
  },
  {
    accessor: "description",
    title: "Description",
    key: "description",
    width: 300,
  },
  { accessor: "status", title: "Status", key: "status", width: 120 },
  { accessor: "lastRunAt", title: "Last Run", key: "lastRunAt", width: 160 },
  { accessor: "nextRunAt", title: "Next Run", key: "nextRunAt", width: 160 },
];

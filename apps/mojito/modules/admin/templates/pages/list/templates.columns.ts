import type { DataTableShellColumn } from "@peppermint/admin";
import { PLATFORM_LABELS, type Template } from "../../module.api";

export const templatesColumns: DataTableShellColumn<Template>[] = [
  { accessor: "name", title: "Name", key: "name", sortable: true },
  {
    accessor: "platform",
    title: "Platform",
    key: "platform",
    sortable: true,
    render: (t) => PLATFORM_LABELS[t.platform],
  },
  { accessor: "description", title: "Description", key: "description", defaultVisible: false },
  {
    accessor: "updatedAt",
    title: "Updated",
    key: "updatedAt",
    sortable: true,
    defaultVisible: true,
  },
  {
    accessor: "slots",
    title: "Slots",
    key: "slots",
    render: (t) => String(t.slots.length),
    defaultVisible: false,
  },
];

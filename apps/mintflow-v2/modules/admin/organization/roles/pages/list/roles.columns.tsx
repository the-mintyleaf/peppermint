import { Badge, Text } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import type { Role, RoleStatus } from "../../roles.types";

const STATUS_COLORS: Record<RoleStatus, string> = {
  active: "green",
  inactive: "gray",
};

export const ROLES_COLUMNS: DataTableShellColumn<Role>[] = [
  { accessor: "name", title: "Role Name", sortable: true, width: 200 },
  { accessor: "description", title: "Description", width: 320 },
  {
    accessor: "permissions",
    title: "Permissions",
    width: 120,
    render: (record) => (
      <Text size="xs">
        {record.permissions.reduce((sum, p) => sum + p.actions.length, 0)} assigned
      </Text>
    ),
  },
  {
    accessor: "status",
    title: "Status",
    width: 90,
    render: (record) => (
      <Badge size="xs" color={STATUS_COLORS[record.status as RoleStatus] ?? "gray"}>
        {record.status}
      </Badge>
    ),
  },
];

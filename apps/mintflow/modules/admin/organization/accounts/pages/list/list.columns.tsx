import { Badge, Text } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import type { Account, AccountStatus } from "../../accounts.types";

const STATUS_COLORS: Record<AccountStatus, string> = {
  active: "green",
  inactive: "gray",
  suspended: "red",
};

export const ACCOUNTS_COLUMNS: DataTableShellColumn<Account>[] = [
  {
    accessor: "fullName",
    title: "Full Name",
    sortable: true,
    width: 200,
    filter: { type: "text", placeholder: "Search by name" },
  },
  {
    accessor: "roleName",
    title: "Role",
    width: 140,
    filter: { type: "text", placeholder: "Search by role" },
    render: (record) =>
      record.roleName ? (
        <Badge size="xs" variant="light" color="blue">
          {record.roleName as string}
        </Badge>
      ) : (
        <Text size="xs" c="dimmed">No role</Text>
      ),
  },
  { accessor: "birthday", title: "Birthday", width: 120 },
  { accessor: "address", title: "Address", width: 240 },
  {
    accessor: "personalizedPermissions",
    title: "Custom Permissions",
    width: 140,
    render: (record) => {
      const count = (record.personalizedPermissions as { actions: string[] }[]).reduce(
        (sum, p) => sum + p.actions.length,
        0,
      );
      return (
        <Text size="xs" c={count > 0 ? "blue" : "dimmed"}>
          {count > 0 ? `${count} override${count === 1 ? "" : "s"}` : "None"}
        </Text>
      );
    },
  },
  {
    accessor: "status",
    title: "Status",
    width: 100,
    filter: {
      type: "select",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Suspended", value: "suspended" },
      ],
    },
    render: (record) => (
      <Badge size="xs" color={STATUS_COLORS[record.status as AccountStatus] ?? "gray"}>
        {record.status}
      </Badge>
    ),
  },
];

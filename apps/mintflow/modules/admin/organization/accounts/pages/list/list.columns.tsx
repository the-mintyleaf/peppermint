import { Avatar, Badge, Group, Text } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import { CakeIcon } from "@phosphor-icons/react/dist/csr/Cake";
import { EnvelopeIcon } from "@phosphor-icons/react/dist/csr/Envelope";
import { KeyIcon } from "@phosphor-icons/react/dist/csr/Key";
import { MapPinIcon } from "@phosphor-icons/react/dist/csr/MapPin";
import { PhoneIcon } from "@phosphor-icons/react/dist/csr/Phone";
import { PulseIcon } from "@phosphor-icons/react/dist/csr/Pulse";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/csr/ShieldCheck";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import type { Account, AccountStatus } from "../../accounts.types";

const STATUS_COLORS: Record<AccountStatus, string> = {
  active: "green",
  inactive: "gray",
  suspended: "red",
};

const STATUS_ICON_COLORS: Record<AccountStatus, string> = {
  active: "var(--mantine-color-green-6)",
  inactive: "var(--mantine-color-gray-6)",
  suspended: "var(--mantine-color-red-6)",
};

export const ACCOUNTS_COLUMNS: DataTableShellColumn<Account>[] = [
  {
    accessor: "fullName",
    title: "Name",
    icon: UserIcon,
    sortable: true,
    width: 220,
    filter: { type: "text", placeholder: "Search by name" },
    render: (record) => (
      <Group gap="sm" wrap="nowrap">
        <Avatar size="sm" radius="xl" name={record.fullName} />
        <Text size="xs" fw={500}>
          {record.fullName}
        </Text>
      </Group>
    ),
  },
  {
    accessor: "status",
    title: "Status",
    icon: PulseIcon,
    width: 120,
    filter: {
      type: "select",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Suspended", value: "suspended" },
      ],
    },
    render: (record) => {
      const status = record.status as AccountStatus;
      const StatusIcon = status === "active" ? CheckIcon : XIcon;
      return (
        <Group gap={6} wrap="nowrap">
          <StatusIcon
            size={12}
            weight="bold"
            color={STATUS_ICON_COLORS[status]}
            aria-hidden
          />
          <Badge size="xs" color={STATUS_COLORS[status] ?? "gray"}>
            {status}
          </Badge>
        </Group>
      );
    },
  },
  {
    accessor: "phone",
    title: "Number",
    icon: PhoneIcon,
    width: 130,
    filter: { type: "text", placeholder: "Search by number" },
  },
  {
    accessor: "email",
    title: "Email",
    icon: EnvelopeIcon,
    width: 220,
    filter: { type: "text", placeholder: "Search by email" },
  },
  {
    accessor: "roleName",
    title: "Role",
    icon: ShieldCheckIcon,
    width: 140,
    filter: { type: "text", placeholder: "Search by role" },
    render: (record) =>
      record.roleName ? (
        <Badge size="xs" variant="dot" color="blue">
          {record.roleName as string}
        </Badge>
      ) : (
        <Text size="xs" c="dimmed">No role</Text>
      ),
  },
  { accessor: "birthday", title: "Birthday", icon: CakeIcon, width: 120 },
  { accessor: "address", title: "Address", icon: MapPinIcon, width: 240 },
  {
    accessor: "personalizedPermissions",
    title: "Custom Permissions",
    icon: KeyIcon,
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
];

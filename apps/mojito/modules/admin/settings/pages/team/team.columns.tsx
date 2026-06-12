import type { DataTableShellColumn } from "@zetsel/admin";
import { Avatar, Badge, Group, Stack, Text } from "@zetsel/ui";
import type { TeamMemberRow } from "../../team.types";

const ROLE_COLOR: Record<TeamMemberRow["role"], string> = {
  owner: "red",
  admin: "orange",
  editor: "blue",
  viewer: "gray",
};

const STATUS_COLOR: Record<TeamMemberRow["status"], string> = {
  active: "green",
  invited: "yellow",
  suspended: "red",
};

export const teamColumns: DataTableShellColumn<TeamMemberRow>[] = [
  {
    accessor: "name",
    title: "Member",
    render: (record) => (
      <Group gap="sm">
        <Avatar size="sm" src={record.avatarUrl} radius="xl">
          {record.name.charAt(0)}
        </Avatar>
        <Stack gap={0}>
          <Text size="xs" fw={500}>{record.name}</Text>
          <Text size="xs" c="dimmed">{record.email}</Text>
        </Stack>
      </Group>
    ),
  },
  {
    accessor: "role",
    title: "Role",
    render: (record) => (
      <Badge size="xs" color={ROLE_COLOR[record.role]} variant="light">
        {record.role}
      </Badge>
    ),
    width: 100,
  },
  {
    accessor: "status",
    title: "Status",
    render: (record) => (
      <Badge size="xs" color={STATUS_COLOR[record.status]} variant="light">
        {record.status}
      </Badge>
    ),
    width: 100,
  },
  {
    accessor: "joinedAt",
    title: "Joined",
    render: (record) => record.joinedAt.toLocaleDateString(),
    width: 110,
  },
];

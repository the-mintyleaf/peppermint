import type { DataTableShellColumn } from "@zetsel/admin";
import { Badge, Text } from "@zetsel/ui";
import type { Channel, ChannelPlatform, ChannelStatus } from "../../channels.types";

const platformLabel: Record<ChannelPlatform, string> = {
  instagram: "Instagram",
  twitter: "X / Twitter",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  youtube: "YouTube",
  pinterest: "Pinterest",
};

const statusColor: Record<ChannelStatus, string> = {
  connected: "green",
  disconnected: "gray",
  expired: "yellow",
  error: "red",
};

export const channelsColumns: DataTableShellColumn<Channel>[] = [
  {
    accessor: "displayName",
    title: "Account",
    sortable: true,
    render: (record) => (
      <div>
        <Text fw={500} size="sm">{record.displayName}</Text>
        <Text size="xs" c="dimmed">{record.handle}</Text>
      </div>
    ),
  },
  {
    accessor: "platform",
    title: "Platform",
    sortable: true,
    render: (record) => <Text size="sm">{platformLabel[record.platform]}</Text>,
  },
  {
    accessor: "status",
    title: "Status",
    render: (record) => (
      <Badge color={statusColor[record.status]} variant="light">
        {record.status}
      </Badge>
    ),
  },
  {
    accessor: "followersCount",
    title: "Followers",
    sortable: true,
    render: (record) =>
      record.followersCount != null ? (
        <Text size="sm">{record.followersCount.toLocaleString()}</Text>
      ) : (
        <Text size="sm" c="dimmed">—</Text>
      ),
  },
  {
    accessor: "connectedAt",
    title: "Connected",
    sortable: true,
    render: (record) => <Text size="sm">{record.connectedAt}</Text>,
  },
];

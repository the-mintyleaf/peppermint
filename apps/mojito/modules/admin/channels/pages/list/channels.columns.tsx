import type { DataTableShellColumn } from "@peppermint/admin";
import { Badge, Text } from "@peppermint/ui";
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
        <Text fw={500} size="xs">{record.displayName}</Text>
        <Text size="xs" c="dimmed">{record.handle}</Text>
      </div>
    ),
  },
  {
    accessor: "platform",
    title: "Platform",
    sortable: true,
    render: (record) => platformLabel[record.platform],
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
      record.followersCount != null
        ? record.followersCount.toLocaleString()
        : "—",
  },
  {
    accessor: "connectedAt",
    title: "Connected",
    sortable: true,
    render: (record) => record.connectedAt,
  },
];

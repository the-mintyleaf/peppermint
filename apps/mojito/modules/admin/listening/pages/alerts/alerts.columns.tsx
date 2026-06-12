"use client";

import type { DataTableShellColumn } from "@zetsel/admin";
import { Badge, Text, ActionIcon, Group } from "@zetsel/ui";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markAlertReadById } from "../../alerts.api";
import { alertQueryKeys } from "../../alerts.queryKeys";
import type { AlertRow } from "../../alerts.types";

const ALERT_COLOR: Record<AlertRow["type"], string> = {
  volume_spike: "blue",
  crisis: "red",
  keyword_mention: "violet",
};

function MarkReadButton({ id }: { id: string }) {
  const qc = useQueryClient();
  const markRead = useMutation({
    mutationFn: () => markAlertReadById(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [alertQueryKeys.list()] }),
  });

  return (
    <ActionIcon
      size="sm"
      variant="subtle"
      disabled={markRead.isPending}
      onClick={() => markRead.mutate()}
      aria-label="Mark as read"
    >
      <CheckIcon size={14} />
    </ActionIcon>
  );
}

export const alertsColumns: DataTableShellColumn<AlertRow>[] = [
  {
    accessor: "type",
    title: "Type",
    render: (record) => (
      <Badge size="xs" color={ALERT_COLOR[record.type]} variant="light">
        {record.type.replace("_", " ")}
      </Badge>
    ),
    width: 130,
  },
  {
    accessor: "text",
    title: "Message",
    render: (record) => (
      <Text size="xs" fw={record.read ? 400 : 500} c={record.read ? "dimmed" : undefined}>
        {record.text}
      </Text>
    ),
  },
  {
    accessor: "triggeredAt",
    title: "Triggered",
    render: (record) => (
      <Text size="xs" c="dimmed">{record.triggeredAt.toLocaleString()}</Text>
    ),
    width: 160,
  },
  {
    accessor: "read",
    title: "Status",
    render: (record) => (
      <Badge size="xs" color={record.read ? "gray" : "red"} variant="light">
        {record.read ? "Read" : "Unread"}
      </Badge>
    ),
    width: 90,
  },
  {
    accessor: "actions",
    title: "",
    render: (record) => (
      <Group gap="xs" justify="flex-end">
        {!record.read && <MarkReadButton id={record.id} />}
      </Group>
    ),
    width: 60,
  },
];

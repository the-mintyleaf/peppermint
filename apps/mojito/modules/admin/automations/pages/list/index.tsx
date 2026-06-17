"use client";

import { Paper, Badge, Group, Text, ActionIcon, Tooltip } from "@peppermint/ui";
import { DataTableShell } from "@peppermint/admin";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlayIcon } from "@phosphor-icons/react/dist/csr/Play";
import { PauseIcon } from "@phosphor-icons/react/dist/csr/Pause";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import type { DataTableShellTab, DataTableShellColumn } from "@peppermint/admin";
import { fetchAutomations, runAutomation, pauseAutomation, type Automation, type AutomationStatus } from "../../module.api";
import type { QueryParams } from "@peppermint/admin";

const STATUS_COLORS: Record<string, string> = {
  running: "blue",
  scheduled: "teal",
  paused: "yellow",
  error: "red",
  idle: "gray",
};

const LAST_RUN_ICONS: Record<string, string> = {
  success: "✓",
  partial: "⚠",
  failed: "✗",
};

function relativeTime(iso?: string): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ago`;
  if (hrs > 0) return `${hrs}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "just now";
}

function futureTime(iso?: string): string {
  if (!iso) return "Manual only";
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "now";
  const mins = Math.floor(diff / 60_000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `in ${days}d`;
  if (hrs > 0) return `in ${hrs}h`;
  return `in ${mins}m`;
}

const TABS: DataTableShellTab[] = [
  { label: "All" },
  { label: "Running", filter: { status: "running" } },
  { label: "Paused", filter: { status: "paused" } },
  { label: "Error", filter: { status: "error" } },
];

export function AutomationsList() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate: triggerRun } = useMutation({
    mutationFn: (id: string) => runAutomation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["automations"] }),
  });

  const { mutate: togglePause } = useMutation({
    mutationFn: ({ id, pause }: { id: string; pause: boolean }) => pauseAutomation(id, pause),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["automations"] }),
  });

  const columns: DataTableShellColumn<Automation>[] = [
    {
      accessor: "name",
      title: "Automation",
      key: "name",
      sortable: true,
      width: 260,
      render: (row) => (
        <Text
          size="xs"
          fw={500}
          style={{ cursor: "pointer", textDecoration: "underline dotted" }}
          onClick={() => router.push(`/admin/automation/workflows/${row.id}`)}
        >
          {row.name}
        </Text>
      ),
    },
    {
      accessor: "status",
      title: "Status",
      key: "status",
      width: 110,
      render: (row) => (
        <Badge size="xs" color={STATUS_COLORS[row.status] ?? "gray"} tt="capitalize">
          {row.status}
        </Badge>
      ),
    },
    {
      accessor: "lastRunAt",
      title: "Last Run",
      key: "lastRunAt",
      width: 180,
      render: (row) => (
        <Group gap={4}>
          <Text size="xs" c="dimmed">
            {relativeTime(row.lastRunAt)}
          </Text>
          {row.lastRunStatus && (
            <Text size="xs" c={row.lastRunStatus === "success" ? "green" : row.lastRunStatus === "failed" ? "red" : "yellow"}>
              {LAST_RUN_ICONS[row.lastRunStatus]}
            </Text>
          )}
        </Group>
      ),
    },
    {
      accessor: "nextRunAt",
      title: "Next Run",
      key: "nextRunAt",
      width: 120,
      render: (row) => (
        <Text size="xs" c="dimmed">
          {futureTime(row.nextRunAt)}
        </Text>
      ),
    },
    {
      accessor: "id",
      title: "Actions",
      key: "actions",
      width: 100,
      render: (row) => (
        <Group gap={4} onClick={(e) => e.stopPropagation()}>
          <Tooltip label="Run now" withArrow>
            <ActionIcon
              size="sm"
              variant="subtle"
              disabled={row.status === "running"}
              onClick={() => triggerRun(row.id)}
              aria-label="Run automation now"
            >
              <PlayIcon size={13} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={row.status === "paused" ? "Resume" : "Pause"} withArrow>
            <ActionIcon
              size="sm"
              variant="subtle"
              disabled={row.status === "running" || row.status === "idle"}
              onClick={() =>
                togglePause({ id: row.id, pause: row.status !== "paused" })
              }
              aria-label={row.status === "paused" ? "Resume automation" : "Pause automation"}
            >
              {row.status === "paused" ? (
                <ArrowCounterClockwiseIcon size={13} />
              ) : (
                <PauseIcon size={13} />
              )}
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ];

  return (
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)">
      <DataTableShell<Automation>
        queryKey="automations.list"
        queryGetFn={(params?: QueryParams) =>
          fetchAutomations({ status: params?.filters?.status as string | undefined }).then((r) => ({
            data: r.data,
            meta: r.meta,
          }))
        }
        dataKey="data"
        paginationKey="meta"
        enableServerQuery
        columns={columns}
        moduleInfo={{
          name: "Automation",
          label: "Automations",
          description: "Manage your content automation workflows",
        }}
        basePath="/admin/automation/workflows"
        tabs={TABS}
        pageSizes={[10, 25, 50]}
        defaultPageSize={25}
        disableCreateButton
        disableEditButton
        disableDeleteButton
      />
    </Paper>
  );
}

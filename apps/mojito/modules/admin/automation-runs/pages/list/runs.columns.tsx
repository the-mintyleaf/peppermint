import type { DataTableColumn } from "mantine-datatable";
import { Badge, Group, Text, ActionIcon } from "@zetsel/ui";
import { ArrowClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowClockwise";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import type { AutomationRun } from "@/modules/admin/shared/entities.types";
import Link from "next/link";

const STATUS_COLORS: Record<AutomationRun["status"], string> = {
  running: "blue",
  waiting_review: "yellow",
  succeeded: "green",
  partial: "orange",
  failed: "red",
};

function duration(run: AutomationRun & { workflowName?: string }): string {
  if (!run.finishedAt) {
    const secs = Math.floor((Date.now() - run.startedAt.getTime()) / 1000);
    return `${secs}s (running)`;
  }
  const secs = Math.floor((run.finishedAt.getTime() - run.startedAt.getTime()) / 1000);
  return secs < 60 ? `${secs}s` : `${Math.floor(secs / 60)}m ${secs % 60}s`;
}

export function getRunsColumns(
  onRetry: (id: string) => void,
  onCancel: (id: string) => void
): DataTableColumn<AutomationRun & { workflowName: string }>[] {
  return [
    {
      accessor: "workflowName",
      title: "Workflow",
      render: (r) => <Text size="sm" fw={500}>{r.workflowName}</Text>,
    },
    {
      accessor: "status",
      title: "Status",
      render: (r) => (
        <Badge size="sm" color={STATUS_COLORS[r.status]} variant="light">{r.status.replace("_", " ")}</Badge>
      ),
      width: 130,
    },
    {
      accessor: "startedAt",
      title: "Started",
      render: (r) => (
        <Text size="xs" c="dimmed">{new Date(r.startedAt).toLocaleString()}</Text>
      ),
      width: 160,
    },
    {
      accessor: "duration",
      title: "Duration",
      render: (r) => <Text size="xs" c="dimmed">{duration(r)}</Text>,
      width: 120,
    },
    {
      accessor: "actions",
      title: "",
      render: (r) => (
        <Group gap="xs" justify="flex-end">
          <ActionIcon
            size="sm"
            variant="subtle"
            component={Link}
            href={`/admin/automation/runs/${r.id}`}
            aria-label="View run"
          >
            <EyeIcon size={14} />
          </ActionIcon>
          {r.status === "failed" && (
            <ActionIcon size="sm" variant="subtle" color="blue" onClick={() => onRetry(r.id)} aria-label="Retry">
              <ArrowClockwiseIcon size={14} />
            </ActionIcon>
          )}
          {r.status === "running" && (
            <ActionIcon size="sm" variant="subtle" color="red" onClick={() => onCancel(r.id)} aria-label="Cancel">
              <XIcon size={14} />
            </ActionIcon>
          )}
        </Group>
      ),
      width: 100,
    },
  ];
}

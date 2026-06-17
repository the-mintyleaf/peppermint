"use client";

import {
  Stack,
  Group,
  Text,
  Paper,
  Tabs,
  Table,
  Skeleton,
  Center,
  Pagination,
  Badge,
  ActionIcon,
} from "@peppermint/ui";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { ArrowClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowClockwise";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import Link from "next/link";
import { useState } from "react";
import { useRuns, useRetryRun, useCancelRun } from "../../runs.hooks";
import type { AutomationRun } from "@/modules/admin/shared/entities.types";
import { ModulePageShell } from "@/modules/admin/shared/ModulePageShell";

const BASE_PATH = "/admin/automation/runs";
const MODULE_INFO = { name: "runs", label: "Runs & Monitoring" };

const STATUS_COLORS: Record<AutomationRun["status"], string> = {
  running: "blue",
  waiting_review: "yellow",
  succeeded: "green",
  partial: "orange",
  failed: "red",
};

type TabStatus = "all" | AutomationRun["status"];

export function RunsList() {
  const [activeTab, setActiveTab] = useState<TabStatus>("all");
  const [page, setPage] = useState(1);
  const retry = useRetryRun();
  const cancel = useCancelRun();

  const { data, isLoading, isError } = useRuns({
    status: activeTab === "all" ? undefined : activeTab,
    page,
    pageSize: 20,
  });

  const items = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  function handleTabChange(tab: string | null) {
    setActiveTab((tab as TabStatus) ?? "all");
    setPage(1);
  }

  return (
    <ModulePageShell basePath={BASE_PATH} moduleInfo={MODULE_INFO} disableCreateButton>
      <Paper radius="md" withBorder style={{ overflow: "hidden", height: "calc(100vh - 160px)" }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tabs.List>
            {(["all", "running", "waiting_review", "succeeded", "failed"] as TabStatus[]).map((s) => (
              <Tabs.Tab key={s} value={s}>
                {s === "all" ? "All" : s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          <Tabs.Panel value={activeTab} style={{ overflow: "auto", maxHeight: "calc(100vh - 220px)" }}>
            {isLoading && (
              <Stack gap="xs" p="md">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} h={48} radius="sm" />)}
              </Stack>
            )}
            {isError && (
              <Center py="xl"><Text c="red" size="sm">Failed to load runs</Text></Center>
            )}
            {!isLoading && !isError && items.length === 0 && (
              <Center py="xl"><Text c="dimmed" size="sm">No runs found</Text></Center>
            )}
            {!isLoading && items.length > 0 && (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Workflow</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Started</Table.Th>
                    <Table.Th>Duration</Table.Th>
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {items.map((run) => {
                    const durationSecs = run.finishedAt
                      ? Math.floor(
                          (new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime()) / 1000,
                        )
                      : Math.floor((Date.now() - new Date(run.startedAt).getTime()) / 1000);
                    const durationStr =
                      durationSecs < 60 ? `${durationSecs}s` : `${Math.floor(durationSecs / 60)}m`;
                    return (
                      <Table.Tr key={run.id}>
                        <Table.Td><Text size="sm" fw={500}>{run.workflowName}</Text></Table.Td>
                        <Table.Td>
                          <Badge size="sm" color={STATUS_COLORS[run.status]} variant="light">
                            {run.status.replace("_", " ")}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" c="dimmed">{new Date(run.startedAt).toLocaleString()}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" c="dimmed">{durationStr}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs" justify="flex-end">
                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              component={Link}
                              href={`/admin/automation/runs/${run.id}`}
                              aria-label="View"
                            >
                              <EyeIcon size={14} />
                            </ActionIcon>
                            {run.status === "failed" && (
                              <ActionIcon
                                size="sm"
                                variant="subtle"
                                color="blue"
                                onClick={() => retry.mutate(run.id)}
                                aria-label="Retry"
                              >
                                <ArrowClockwiseIcon size={14} />
                              </ActionIcon>
                            )}
                            {run.status === "running" && (
                              <ActionIcon
                                size="sm"
                                variant="subtle"
                                color="red"
                                onClick={() => cancel.mutate(run.id)}
                                aria-label="Cancel"
                              >
                                <XIcon size={14} />
                              </ActionIcon>
                            )}
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            )}
            {totalPages > 1 && (
              <Group justify="center" p="md">
                <Pagination total={totalPages} value={page} onChange={setPage} size="sm" />
              </Group>
            )}
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </ModulePageShell>
  );
}

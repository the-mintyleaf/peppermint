"use client";

import { useState } from "react";
import { Stack, Group, Text, Badge, Anchor, Accordion, Table, Loader, Center } from "@zetsel/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { fetchRuns, type Run } from "../../../../module.api";

const RUN_STATUS_COLORS: Record<string, string> = {
  success: "green",
  partial: "yellow",
  failed: "red",
  running: "blue",
};

function duration(run: Run): string {
  if (!run.endedAt) return "—";
  const ms = new Date(run.endedAt).getTime() - new Date(run.startedAt).getTime();
  const secs = Math.round(ms / 1000);
  if (secs < 60) return `${secs}s`;
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
}

interface RunHistoryProps {
  automationId: string;
}

export function RunHistory({ automationId }: RunHistoryProps) {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["automation-runs", automationId],
    queryFn: () => fetchRuns(automationId),
  });

  if (isLoading) {
    return (
      <Center py="lg">
        <Loader size="sm" />
      </Center>
    );
  }

  const runs = data?.data ?? [];

  if (!runs.length) {
    return (
      <Text size="sm" c="dimmed">
        No runs yet.
      </Text>
    );
  }

  return (
    <Stack gap="sm">
      <Accordion chevronPosition="left" variant="separated">
        {runs.map((run) => (
          <Accordion.Item key={run.id} value={run.id}>
            <Accordion.Control>
              <Group gap="sm" wrap="nowrap">
                <Badge size="xs" color={RUN_STATUS_COLORS[run.status] ?? "gray"}>
                  {run.status}
                </Badge>
                <Text size="xs" fw={500}>
                  {new Date(run.startedAt).toLocaleString()}
                </Text>
                <Text size="xs" c="dimmed">
                  {duration(run)}
                </Text>
                <Text size="xs" c="dimmed">
                  {run.stepsCompleted}/{run.stepsTotal} steps
                </Text>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              {run.steps && run.steps.length > 0 ? (
                <Table fz="xs" withTableBorder withColumnBorders>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Step</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Duration</Table.Th>
                      <Table.Th>Error</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {run.steps.map((step) => (
                      <Table.Tr key={step.nodeId}>
                        <Table.Td>
                          <Text size="xs">{step.nodeLabel}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge size="xs" color={step.status === "success" ? "green" : step.status === "error" ? "red" : "gray"}>
                            {step.status}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" c="dimmed">
                            {step.duration != null ? `${step.duration}s` : "—"}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" c="red">
                            {step.error ?? "—"}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              ) : (
                <Text size="xs" c="dimmed">
                  No step details available.
                </Text>
              )}
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>

      <Anchor
        size="xs"
        onClick={() =>
          router.push(`/admin/content/library?automation_id=${automationId}`)
        }
      >
        View generated content →
      </Anchor>
    </Stack>
  );
}

"use client";

import {
  Stack,
  Group,
  Title,
  Text,
  Paper,
  Badge,
  Timeline,
  Button,
  Alert,
  Collapse,
  Skeleton,
  Center,
  Anchor,
} from "@peppermint/ui";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { XCircleIcon } from "@phosphor-icons/react/dist/csr/XCircle";
import { ClockIcon } from "@phosphor-icons/react/dist/csr/Clock";
import { SpinnerIcon } from "@phosphor-icons/react/dist/csr/Spinner";
import { ArrowClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowClockwise";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { useState } from "react";
import Link from "next/link";
import {
  useRun,
  useApproveGate,
  useRetryRun,
  useCancelRun,
} from "../../runs.hooks";
import type { AutomationStep } from "@/modules/admin/shared/entities.types";

const STATUS_COLORS: Record<string, string> = {
  running: "blue",
  waiting_review: "yellow",
  succeeded: "green",
  partial: "orange",
  failed: "red",
};

function StepIcon({ status }: { status: AutomationStep["status"] }) {
  if (status === "succeeded") return <CheckCircleIcon size={16} />;
  if (status === "failed") return <XCircleIcon size={16} />;
  if (status === "running") return <SpinnerIcon size={16} />;
  return <ClockIcon size={16} />;
}

function StepColor(status: AutomationStep["status"]): string {
  if (status === "succeeded") return "green";
  if (status === "failed") return "red";
  if (status === "running") return "blue";
  return "gray";
}

interface RunViewProps {
  id: string;
}

export function RunView({ id }: RunViewProps) {
  const { data: run, isLoading, isError } = useRun(id);
  const approve = useApproveGate();
  const retry = useRetryRun();
  const cancel = useCancelRun();
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  function toggleStep(stepId: string) {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });
  }

  if (isLoading) {
    return (
      <Stack gap="md">
        <Skeleton h={80} radius="md" />
        <Skeleton h={300} radius="md" />
      </Stack>
    );
  }

  if (isError || !run) {
    return (
      <Center py="xl">
        <Text c="red" size="sm">
          Failed to load run details
        </Text>
      </Center>
    );
  }

  const durationSecs = run.finishedAt
    ? Math.floor(
        (new Date(run.finishedAt).getTime() -
          new Date(run.startedAt).getTime()) /
          1000,
      )
    : Math.floor((Date.now() - new Date(run.startedAt).getTime()) / 1000);

  return (
    <Stack gap="md">
      <Paper p="lg" radius="md" withBorder>
        <Group justify="space-between">
          <Stack gap={4}>
            <Group gap="sm">
              <Title order={3}>{run.workflowName}</Title>
              <Badge color={STATUS_COLORS[run.status]} variant="light">
                {run.status.replace("_", " ")}
              </Badge>
            </Group>
            <Text size="xs" c="dimmed">
              Run ID: {run.id} · Started{" "}
              {new Date(run.startedAt).toLocaleString()} · {durationSecs}s
            </Text>
          </Stack>
          <Group gap="xs">
            {run.status === "failed" && (
              <Button
                size="sm"
                variant="light"
                leftSection={<ArrowClockwiseIcon size={14} />}
                loading={retry.isPending}
                onClick={() => retry.mutate(run.id)}
              >
                Retry
              </Button>
            )}
            {run.status === "running" && (
              <Button
                size="sm"
                color="red"
                variant="light"
                loading={cancel.isPending}
                onClick={() => cancel.mutate(run.id)}
              >
                Cancel
              </Button>
            )}
          </Group>
        </Group>
      </Paper>

      {run.status === "waiting_review" && (
        <Alert
          icon={<WarningIcon size={16} />}
          color="yellow"
          title="Waiting for Approval"
        >
          This workflow is paused at a human-in-the-loop gate. Review the
          generated content and approve to continue.
          <Button
            size="sm"
            mt="sm"
            color="yellow"
            loading={approve.isPending}
            onClick={() => approve.mutate(run.id)}
          >
            Approve & Continue
          </Button>
        </Alert>
      )}

      <Paper p="lg" radius="md" withBorder>
        <Stack gap="md">
          <Text fw={600} size="sm">
            Step Timeline
          </Text>
          <Timeline
            active={
              run.steps.findIndex(
                (s) => s.status === "running" || s.status === "pending",
              ) - 1
            }
          >
            {run.steps.map((step) => (
              <Timeline.Item
                key={step.id}
                bullet={<StepIcon status={step.status} />}
                color={StepColor(step.status)}
                title={
                  <Group gap="sm">
                    <Text size="sm" fw={500}>
                      {step.label}
                    </Text>
                    <Badge
                      size="xs"
                      color={StepColor(step.status)}
                      variant="light"
                    >
                      {step.status}
                    </Badge>
                    {step.log && (
                      <Text
                        size="xs"
                        c="blue"
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleStep(step.id)}
                      >
                        {expandedSteps.has(step.id) ? "Hide log" : "Show log"}
                      </Text>
                    )}
                  </Group>
                }
              >
                {step.log && (
                  <Collapse in={expandedSteps.has(step.id)}>
                    <Paper p="xs" radius="xs" bg="gray.1" mt="xs">
                      <Text size="xs" ff="monospace">
                        {step.log}
                      </Text>
                    </Paper>
                  </Collapse>
                )}
                {step.startedAt && (
                  <Text size="xs" c="dimmed">
                    {new Date(step.startedAt).toLocaleTimeString()}
                    {step.finishedAt &&
                      ` → ${new Date(step.finishedAt).toLocaleTimeString()}`}
                  </Text>
                )}
              </Timeline.Item>
            ))}
          </Timeline>
        </Stack>
      </Paper>

      {run.producedContentIds.length > 0 && (
        <Paper p="lg" radius="md" withBorder>
          <Stack gap="sm">
            <Text fw={600} size="sm">
              Generated Content
            </Text>
            {run.producedContentIds.map((contentId) => (
              <Group key={contentId} justify="space-between">
                <Text size="sm" c="dimmed">
                  {contentId}
                </Text>
                <Group gap="xs">
                  <Anchor
                    component={Link}
                    href={`/admin/publish/library`}
                    size="xs"
                  >
                    View in Library
                  </Anchor>
                  <Anchor
                    component={Link}
                    href={`/admin/publish/approvals`}
                    size="xs"
                  >
                    Review
                  </Anchor>
                </Group>
              </Group>
            ))}
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}

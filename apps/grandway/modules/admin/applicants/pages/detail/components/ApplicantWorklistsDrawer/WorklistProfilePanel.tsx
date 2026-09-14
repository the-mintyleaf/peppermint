"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Anchor,
  Badge,
  Button,
  Center,
  Group,
  Loader,
  Paper,
  Progress,
  Stack,
  Text,
  Title,
} from "@peppermint/ui";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/csr/ArrowSquareOut";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { QueryErrorState } from "@/components/QueryErrorState";
import { useChecklistDetail } from "@/modules/admin/checklists/checklists.hooks";
import {
  CHECKLIST_STATUS_COLORS,
  CHECKLIST_STATUS_LABELS,
} from "@/modules/admin/checklists/checklists.labels";
import { AddChecklistItemModal } from "@/modules/admin/checklists/pages/detail/components/AddChecklistItemModal";
import { ChecklistItemsList } from "@/modules/admin/checklists/pages/detail/components/ChecklistItemsList";
import type { ChecklistDetail } from "@/modules/admin/checklists/checklists.types";

/** One measured line: what it counts, the count, the bar. Two of these are the whole summary. */
function ProgressLine({
  label,
  resolved,
  total,
  color,
}: {
  label: string;
  resolved: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((resolved / total) * 100) : 100;

  return (
    <Stack gap={4}>
      <Group justify="space-between" gap="xs">
        <Text size="xs" c="dimmed">
          {label}
        </Text>
        <Text size="xs" fw={600}>
          {resolved}/{total}
        </Text>
      </Group>
      <Progress value={pct} size="xs" color={pct === 100 ? "green" : color} />
    </Stack>
  );
}

/** Progress, then the blocked count if there is one — the only number that is a warning. */
function WorklistSummary({ worklist }: { worklist: ChecklistDetail }) {
  const { progress } = worklist;

  return (
    <Paper withBorder radius="md" p="sm">
      <Stack gap="sm">
        <ProgressLine
          label="Overall"
          resolved={progress.resolved}
          total={progress.total}
          color="blue"
        />
        <ProgressLine
          label="Required"
          resolved={progress.required_resolved}
          total={progress.required_total}
          color="orange"
        />
        {progress.blocked > 0 ? (
          <Text size="xs" c="red">
            {progress.blocked} blocked — still outstanding
          </Text>
        ) : null}
      </Stack>
    </Paper>
  );
}

/**
 * Level two: the worklist itself, worked in place. The items come from the
 * `checklists` module's own `ChecklistItemsList` — the same grouped rows and
 * the same inline status switch as the full page, so a status set here and a
 * status set there are one flow, not two. The full page stays one click away
 * for the things that belong to it (lifecycle actions, alerts, history).
 */
export function WorklistProfilePanel({ worklistId }: { worklistId: string }) {
  const [addOpen, setAddOpen] = useState(false);
  const {
    data: worklist,
    isLoading,
    isError,
    refetch,
  } = useChecklistDetail(worklistId);

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader size="sm" aria-label="Loading worklist" />
      </Center>
    );
  }

  if (isError || !worklist) {
    return (
      <QueryErrorState
        message="Couldn't load this worklist."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <Stack gap="md">
      <Stack gap={4}>
        <Group gap="xs" wrap="nowrap">
          <Title order={4} style={{ minWidth: 0 }}>
            {worklist.title}
          </Title>
          <Badge
            size="sm"
            variant="light"
            color={CHECKLIST_STATUS_COLORS[worklist.status]}
          >
            {CHECKLIST_STATUS_LABELS[worklist.status]}
          </Badge>
        </Group>
        {worklist.country ? (
          <Text size="xs" c="dimmed">
            {worklist.country.name}
          </Text>
        ) : null}
      </Stack>

      <WorklistSummary worklist={worklist} />

      <Group justify="space-between" wrap="nowrap">
        <Text size="sm" fw={600}>
          Items
        </Text>
        <Group gap="xs" wrap="nowrap">
          <Button
            size="xs"
            variant="light"
            leftSection={<PlusIcon size={14} aria-hidden />}
            onClick={() => setAddOpen(true)}
          >
            Add item
          </Button>
          <Anchor
            size="xs"
            component={Link}
            href={`/admin/checklists/${worklist.id}`}
          >
            <Group gap={4} wrap="nowrap">
              Full page
              <ArrowSquareOutIcon size={13} aria-hidden />
            </Group>
          </Anchor>
        </Group>
      </Group>

      <ChecklistItemsList checklist={worklist} />

      <AddChecklistItemModal
        checklistId={worklist.id}
        opened={addOpen}
        onClose={() => setAddOpen(false)}
      />
    </Stack>
  );
}

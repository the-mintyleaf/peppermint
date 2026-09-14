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
  Stack,
  Text,
  Title,
} from "@peppermint/ui";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/csr/ArrowSquareOut";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { QueryErrorState } from "@/components/QueryErrorState";
import { useChecklistDetail } from "../../checklists.hooks";
import {
  CHECKLIST_STATUS_COLORS,
  CHECKLIST_STATUS_LABELS,
} from "../../checklists.labels";
import { AddChecklistItemModal } from "../../pages/detail/components/AddChecklistItemModal";
import { ChecklistItemsList } from "../../pages/detail/components/ChecklistItemsList";
import { WorklistProgressCard } from "../WorklistProgressCard";

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

      <WorklistProgressCard progress={worklist.progress} />

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

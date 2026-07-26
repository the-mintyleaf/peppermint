"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Center, Group, Loader, Stack, Text } from "@peppermint/ui";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/csr/ArrowSquareOut";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { QueryErrorState } from "@/components/QueryErrorState";
// Concrete-file / deep imports of the `checklists` module — the per-journey
// checklist and its tickable items already live there, so the journey surfaces
// them rather than rebuilding. (No cycle: these files don't import journeys.)
import {
  useChecklistDetail,
  useChecklistsList,
} from "@/modules/admin/checklists/checklists.hooks";
import { AddChecklistItemModal } from "@/modules/admin/checklists/pages/detail/components/AddChecklistItemModal";
import { ChecklistItemsList } from "@/modules/admin/checklists/pages/detail/components/ChecklistItemsList";
import { journeyChecklistListParams } from "../../../../applicantJourneys.checklist";
import { useCreateJourneyWorklist } from "../../../../applicantJourneys.hooks";
import type { JourneyChecklistPanelProps } from "./JourneyChecklistPanel.types";

/**
 * The journey's checklist, inline on its detail page: reads the checklist by
 * journey, then its items, and reuses the `checklists` module's own
 * `ChecklistItemsList` (ticking via its `ItemStatusModal`) so there is one
 * ticking flow, not two. When a journey has no checklist yet, it offers to
 * create one (the same thing entering Profile Building does automatically).
 */
export function JourneyChecklistPanel({ journey }: JourneyChecklistPanelProps) {
  const [addOpen, setAddOpen] = useState(false);
  const listQuery = useChecklistsList(journeyChecklistListParams(journey.id));
  const checklistRow = listQuery.data?.data[0] ?? null;
  const detailQuery = useChecklistDetail(checklistRow?.id ?? null);
  const createMutation = useCreateJourneyWorklist();

  if (listQuery.isLoading) {
    return (
      <Center py="md">
        <Loader size="sm" aria-label="Loading worklist" />
      </Center>
    );
  }

  if (listQuery.isError) {
    return (
      <QueryErrorState
        message="Couldn't load the worklist."
        onRetry={() => listQuery.refetch()}
        isRetrying={listQuery.isRefetching}
      />
    );
  }

  if (!checklistRow) {
    return (
      <Stack gap="sm" align="flex-start">
        <Text size="xs" c="dimmed">
          No worklist for this journey yet.
        </Text>
        <Button
          size="xs"
          leftSection={<PlusIcon size={14} aria-hidden />}
          loading={createMutation.isPending}
          onClick={() =>
            createMutation.mutate({
              journey: journey.id,
              title: "Profile Building",
            })
          }
        >
          Create worklist
        </Button>
      </Stack>
    );
  }

  if (detailQuery.isLoading) {
    return (
      <Center py="md">
        <Loader size="sm" aria-label="Loading worklist items" />
      </Center>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <QueryErrorState
        message="Couldn't load worklist items."
        onRetry={() => detailQuery.refetch()}
        isRetrying={detailQuery.isRefetching}
      />
    );
  }

  const checklist = detailQuery.data;

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="center" wrap="nowrap">
        <Text size="xs" fw={600} c="dimmed">
          {checklist.progress.resolved} of {checklist.progress.total} done
        </Text>
        <Group gap="xs" wrap="nowrap">
          <Button
            size="xs"
            variant="default"
            component={Link}
            href={`/admin/checklists/${checklist.id}`}
            rightSection={<ArrowSquareOutIcon size={14} aria-hidden />}
          >
            Open worklist
          </Button>
          <Button
            size="xs"
            leftSection={<PlusIcon size={14} aria-hidden />}
            onClick={() => setAddOpen(true)}
          >
            Add item
          </Button>
        </Group>
      </Group>

      <ChecklistItemsList checklist={checklist} />

      <AddChecklistItemModal
        checklistId={checklist.id}
        opened={addOpen}
        onClose={() => setAddOpen(false)}
      />
    </Stack>
  );
}

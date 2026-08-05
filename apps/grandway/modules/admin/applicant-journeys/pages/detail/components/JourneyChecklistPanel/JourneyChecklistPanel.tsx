"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Center, Loader, Modal, Stack, Text } from "@peppermint/ui";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/csr/ArrowSquareOut";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { ProfilePanelHeader } from "@/components/profile";
import { QueryErrorState } from "@/components/QueryErrorState";
// Concrete-file / deep imports of the `checklists` module, never its barrel —
// the per-journey checklist, its create form and its tickable items already
// live there, so the journey surfaces them rather than rebuilding. The create
// form reaches back into this module for its journey picker, but only through
// concrete files (`applicantJourneys.api`), so no barrel-to-barrel cycle closes.
import {
  useChecklistDetail,
  useChecklistsList,
} from "@/modules/admin/checklists/checklists.hooks";
import { ChecklistCreateForm } from "@/modules/admin/checklists/form/ChecklistCreateForm";
import { toCreateChecklistPayload } from "@/modules/admin/checklists/form/ChecklistCreateForm.utils";
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
 * create one — the same form the stage switch opens on a move into Profile
 * Building, so both paths let staff pick the template.
 *
 * The panel header is rendered in every state, including loading and error —
 * a tab that shows only a spinner never tells you what it was going to show.
 */
export function JourneyChecklistPanel({ journey }: JourneyChecklistPanelProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const listQuery = useChecklistsList(journeyChecklistListParams(journey.id));
  const checklistRow = listQuery.data?.data[0] ?? null;
  const detailQuery = useChecklistDetail(checklistRow?.id ?? null);
  const createMutation = useCreateJourneyWorklist();

  const checklist = detailQuery.data;
  // Two chained fetches, one spinner: the second only runs once the first has
  // found a checklist, so "loading" spans both rather than flashing the
  // no-worklist state in between.
  const isLoading =
    listQuery.isLoading || (checklistRow !== null && detailQuery.isLoading);

  return (
    <Stack gap="md">
      <ProfilePanelHeader
        title="Worklist"
        description={
          checklist
            ? `${checklist.progress.resolved} of ${checklist.progress.total} done`
            : "Steps to complete for this journey"
        }
        action={
          checklist ? (
            <>
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
            </>
          ) : undefined
        }
      />

      {isLoading ? (
        <Center py="md">
          <Loader size="sm" aria-label="Loading worklist" />
        </Center>
      ) : listQuery.isError ? (
        <QueryErrorState
          message="Couldn't load the worklist."
          onRetry={() => listQuery.refetch()}
          isRetrying={listQuery.isRefetching}
        />
      ) : !checklistRow ? (
        <Stack gap="sm" align="flex-start">
          <Text size="xs" c="dimmed">
            No worklist for this journey yet. Setting the journey&apos;s
            destination country creates one automatically from that
            country&apos;s template.
          </Text>
          <Button
            size="xs"
            leftSection={<PlusIcon size={14} aria-hidden />}
            onClick={() => setCreateOpen(true)}
          >
            Create worklist
          </Button>
        </Stack>
      ) : detailQuery.isError || !checklist ? (
        <QueryErrorState
          message="Couldn't load worklist items."
          onRetry={() => detailQuery.refetch()}
          isRetrying={detailQuery.isRefetching}
        />
      ) : (
        <ChecklistItemsList checklist={checklist} />
      )}

      {checklist ? (
        <AddChecklistItemModal
          checklistId={checklist.id}
          opened={addOpen}
          onClose={() => setAddOpen(false)}
        />
      ) : null}

      <Modal
        opened={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create worklist"
      >
        <ChecklistCreateForm
          journeyId={journey.id}
          submitLabel="Create worklist"
          isLoading={createMutation.isPending}
          onSubmit={(values) => {
            createMutation.mutate(toCreateChecklistPayload(values), {
              onSuccess: () => setCreateOpen(false),
            });
          }}
        />
      </Modal>
    </Stack>
  );
}

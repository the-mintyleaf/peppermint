"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Center,
  Group,
  Loader,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@peppermint/ui";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { QueryErrorState } from "@/components/QueryErrorState";
// Concrete-file import of applicant-journeys (never its barrel), the same way
// `checklists/form`'s JourneyPickerField reaches it: the create+activate
// mutation and its worklist copy already live there, so a blank worklist made
// here lands active exactly as one made from the journey does.
import { useCreateJourneyWorklist } from "@/modules/admin/applicant-journeys/applicantJourneys.hooks";
import { useChecklistsList } from "../../checklists.hooks";
import { ChecklistCreateForm } from "../../form/ChecklistCreateForm";
import { toCreateChecklistPayload } from "../../form/ChecklistCreateForm.utils";
import {
  applicantWorklistListParams,
  searchWorklists,
  sortWorklists,
  visibleWorklists,
  WORKLIST_SORT_OPTIONS,
  type WorklistSortKey,
} from "./worklistDrawer.utils";
import { WorklistRow } from "./WorklistRow";

/** Heading, count line, and the one lever that belongs at this level. */
function PickerHeader({
  applicantName,
  shown,
  total,
  hiddenArchived,
  onCreate,
}: {
  applicantName: string | null;
  shown: number;
  total: number;
  hiddenArchived: number;
  onCreate: () => void;
}) {
  return (
    <Group justify="space-between" align="flex-end" wrap="nowrap" gap="md">
      <Stack gap={2} style={{ minWidth: 0 }}>
        <Title order={4}>{applicantName ?? "Worklists"}</Title>
        <Text size="xs" c="dimmed">
          {/* Say what is on screen against what exists — a filtered count on
              its own reads as the whole truth. */}
          Showing {shown} of {total} {total === 1 ? "worklist" : "worklists"}
          {hiddenArchived > 0 ? ` · ${hiddenArchived} archived hidden` : ""}
        </Text>
      </Stack>
      <Button
        size="xs"
        leftSection={<PlusIcon size={14} aria-hidden />}
        onClick={onCreate}
        style={{ flexShrink: 0 }}
      >
        New
      </Button>
    </Group>
  );
}

/**
 * Level one of the drawer: which worklist. An applicant has one per journey, so
 * this is a short list — it stays a list rather than collapsing to the first
 * match, because "which of their objectives is this about" is the question the
 * operator is actually answering here.
 */
export function WorklistPickerPanel({
  applicantId,
  onSelect,
}: {
  applicantId: string;
  onSelect: (worklistId: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<WorklistSortKey>("active");
  const [createOpen, setCreateOpen] = useState(false);
  const createMutation = useCreateJourneyWorklist();

  const { data, isLoading, isError, isRefetching, refetch } = useChecklistsList(
    applicantWorklistListParams(applicantId),
  );

  const rows = useMemo(() => data?.data ?? [], [data?.data]);
  const visible = useMemo(() => visibleWorklists(rows), [rows]);
  const worklists = useMemo(
    () => sortWorklists(searchWorklists(visible, search), sortKey),
    [visible, search, sortKey],
  );

  // Every row carries the applicant it belongs to, so the heading names the
  // person without the drawer having to be told who they are.
  const applicantName = rows[0]?.applicant.full_name ?? null;
  // The page is capped at 50: when more exist server-side, a local "no match"
  // is not proof none exists, and the count line must not claim otherwise.
  const truncated = (data?.meta.total ?? 0) > rows.length;

  const createModal = (
    <Modal
      opened={createOpen}
      onClose={() => setCreateOpen(false)}
      title="New worklist"
      size="lg"
    >
      <ChecklistCreateForm
        applicantId={applicantId}
        submitLabel="Create worklist"
        isLoading={createMutation.isPending}
        onSubmit={(values) => {
          createMutation.mutate(toCreateChecklistPayload(values), {
            onSuccess: (created) => {
              setCreateOpen(false);
              // Straight into what was just made — the reason for creating one
              // is to work it, and the picker would otherwise be a dead stop.
              onSelect(created.id);
            },
          });
        }}
      />
    </Modal>
  );

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader size="sm" aria-label="Loading worklists" />
      </Center>
    );
  }

  if (isError) {
    return (
      <QueryErrorState
        message="Couldn't load this applicant's worklists."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
      />
    );
  }

  return (
    <Stack gap="md">
      <PickerHeader
        applicantName={applicantName}
        shown={worklists.length}
        total={visible.length}
        hiddenArchived={rows.length - visible.length}
        onCreate={() => setCreateOpen(true)}
      />

      {visible.length > 1 ? (
        <Group gap="xs" wrap="nowrap" align="flex-start">
          <TextInput
            size="xs"
            style={{ flex: 1 }}
            placeholder="Search worklists"
            aria-label="Search worklists"
            leftSection={<MagnifyingGlassIcon size={14} aria-hidden />}
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
          />
          <Select
            size="xs"
            w={140}
            aria-label="Sort worklists"
            allowDeselect={false}
            data={WORKLIST_SORT_OPTIONS}
            value={sortKey}
            onChange={(value) =>
              setSortKey((value as WorklistSortKey | null) ?? "active")
            }
            style={{ flexShrink: 0 }}
          />
        </Group>
      ) : null}

      {visible.length === 0 ? (
        <Text size="sm" c="dimmed" py="lg">
          No worklists yet. Setting a journey&apos;s destination country creates
          one automatically from that country&apos;s requirement template — or
          add one here.
        </Text>
      ) : worklists.length === 0 ? (
        <Text size="sm" c="dimmed" py="lg">
          No worklists match &ldquo;{search}&rdquo;.
        </Text>
      ) : (
        <Stack gap="xs">
          {worklists.map((worklist) => (
            <WorklistRow
              key={worklist.id}
              worklist={worklist}
              onOpen={() => onSelect(worklist.id)}
            />
          ))}
        </Stack>
      )}

      {truncated ? (
        <Text size="xs" c="dimmed" ta="center">
          Showing the {rows.length} most recent — older worklists live on the
          requirements worklist page.
        </Text>
      ) : null}

      {createModal}
    </Stack>
  );
}

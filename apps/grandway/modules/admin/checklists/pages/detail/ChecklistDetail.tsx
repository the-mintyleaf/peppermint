"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Badge,
  Button,
  Center,
  Group,
  Loader,
  ModalPaper,
  ModuleHeader,
  Progress,
  Stack,
  Text,
  Title,
} from "@peppermint/ui";
import { openReasonConfirmModal } from "@peppermint/admin";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { ArchiveIcon } from "@phosphor-icons/react/dist/csr/Archive";
import { RequireLeadAccess } from "@/components/RequireLeadAccess";
import { getApiError } from "@/lib/authErrorMessages";
import {
  useArchiveChecklist,
  useChecklistDetail,
  useCompleteChecklist,
  useReopenChecklist,
  useRestoreChecklist,
} from "../../checklists.hooks";
import {
  CHECKLIST_STATUS_COLORS,
  CHECKLIST_STATUS_LABELS,
} from "../../checklists.labels";
import type { RequiredItemsPendingItem } from "../../checklists.types";
import { AddChecklistItemModal } from "./components/AddChecklistItemModal";
import { ChecklistItemsList } from "./components/ChecklistItemsList";

function ChecklistDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [pendingItemIds, setPendingItemIds] = useState<Set<string> | null>(
    null,
  );
  const {
    data: checklist,
    isLoading,
    isError,
    error,
    refetch,
  } = useChecklistDetail(id);
  const completeMutation = useCompleteChecklist(id);
  const archiveMutation = useArchiveChecklist(id);
  const restoreMutation = useRestoreChecklist(id);
  const reopenMutation = useReopenChecklist(id);

  const notFound =
    isError && getApiError(error).code === "CHECKLISTS_CHECKLIST_NOT_FOUND";

  if (isLoading) {
    return (
      <ModalPaper withBorder>
        <Center h={300}>
          <Loader size="sm" />
        </Center>
      </ModalPaper>
    );
  }

  if (notFound) {
    return (
      <ModalPaper withBorder>
        <Stack align="center" gap="xs" py="xl">
          <Text size="sm" c="dimmed">
            Checklist not found.
          </Text>
          <Button
            size="xs"
            variant="default"
            onClick={() => router.push("/admin/checklists")}
          >
            Back to checklists
          </Button>
        </Stack>
      </ModalPaper>
    );
  }

  if (isError || !checklist) {
    return (
      <ModalPaper withBorder>
        <Stack align="center" gap="xs" py="xl">
          <Text size="sm" c="dimmed">
            Couldn&apos;t load this checklist.
          </Text>
          <Button size="xs" variant="default" onClick={() => refetch()}>
            Try again
          </Button>
        </Stack>
      </ModalPaper>
    );
  }

  const { progress } = checklist;
  const resolvedPct =
    progress.total > 0
      ? Math.round((progress.resolved / progress.total) * 100)
      : 0;
  const requiredPct =
    progress.required_total > 0
      ? Math.round((progress.required_resolved / progress.required_total) * 100)
      : 100;
  const canComplete =
    checklist.status === "active" &&
    progress.required_resolved === progress.required_total;
  const canArchive = checklist.status !== "archived";
  const canRestore = checklist.status === "archived";
  const canReopen = checklist.status === "completed";

  const handleComplete = () => {
    setPendingItemIds(null);
    completeMutation.mutate(undefined, {
      onError: (err) => {
        const apiError = getApiError(err);
        if (apiError.code === "CHECKLISTS_REQUIRED_ITEMS_PENDING") {
          const items =
            (apiError.details?.items as
              | RequiredItemsPendingItem[]
              | undefined) ?? [];
          setPendingItemIds(new Set(items.map((i) => i.id)));
        }
      },
    });
  };

  const handleArchive = () => {
    openReasonConfirmModal({
      title: "Archive checklist",
      parentLabel: "Checklists",
      tone: "warning",
      alertTitle: "This takes the checklist out of active work",
      description:
        "Nothing is deleted — the checklist can be restored later, and archiving frees a fresh copy of the same template to be applied. A reason is required.",
      reasonLabel: "Reason",
      confirmLabel: "Archive checklist",
      confirmColor: "red",
      onConfirm: async (reason) => {
        await archiveMutation.mutateAsync({ reason });
      },
    });
  };

  const handleRestore = () => {
    const priorLabel =
      checklist.status_before_archive !== ""
        ? CHECKLIST_STATUS_LABELS[checklist.status_before_archive]
        : "its prior status";
    openReasonConfirmModal({
      title: "Restore checklist",
      parentLabel: "Checklists",
      hideReason: true,
      tone: "info",
      alertTitle: "This returns the checklist to its prior status",
      description: `It will return to "${priorLabel}" — restore is not a reopen.`,
      confirmLabel: "Restore checklist",
      confirmColor: "teal",
      onConfirm: async () => {
        await restoreMutation.mutateAsync();
      },
    });
  };

  const handleReopen = () => {
    openReasonConfirmModal({
      title: "Reopen checklist",
      parentLabel: "Checklists",
      reasonRequired: false,
      tone: "info",
      alertTitle: "Items can be changed again",
      description: "The completion stamp is cleared.",
      confirmLabel: "Reopen checklist",
      onConfirm: async (reason) => {
        await reopenMutation.mutateAsync(reason ? { reason } : {});
      },
    });
  };

  return (
    <>
      <ModuleHeader
        breadcrumbItems={[
          { label: "Checklists", href: "/admin/checklists" },
          { label: checklist.title, href: `/admin/checklists/${checklist.id}` },
        ]}
      />
      <ModalPaper withBorder>
        <Stack gap="md" p="md">
          <Group justify="space-between" align="flex-start" wrap="wrap">
            <Stack gap={4}>
              <Group gap="xs">
                <Title order={4}>{checklist.title}</Title>
                <Badge
                  size="sm"
                  variant="light"
                  color={CHECKLIST_STATUS_COLORS[checklist.status]}
                >
                  {CHECKLIST_STATUS_LABELS[checklist.status]}
                </Badge>
              </Group>
              <Group gap={4}>
                <Text
                  size="xs"
                  component={Link}
                  href={`/admin/applicants/${checklist.applicant.id}`}
                >
                  {checklist.applicant.full_name}
                </Text>
                {checklist.country ? (
                  <Text size="xs" c="dimmed">
                    · {checklist.country.name}
                  </Text>
                ) : null}
              </Group>
            </Stack>

            <Group gap="xs">
              {checklist.status === "active" ? (
                <Button
                  size="xs"
                  leftSection={<CheckCircleIcon size={14} aria-hidden />}
                  loading={completeMutation.isPending}
                  disabled={!canComplete}
                  title={
                    canComplete
                      ? undefined
                      : "Every required item must be resolved first"
                  }
                  onClick={handleComplete}
                >
                  Complete checklist
                </Button>
              ) : null}
              {canReopen ? (
                <Button
                  size="xs"
                  variant="default"
                  leftSection={
                    <ArrowCounterClockwiseIcon size={14} aria-hidden />
                  }
                  loading={reopenMutation.isPending}
                  onClick={handleReopen}
                >
                  Reopen
                </Button>
              ) : null}
              {canRestore ? (
                <Button
                  size="xs"
                  variant="default"
                  color="teal"
                  leftSection={
                    <ArrowCounterClockwiseIcon size={14} aria-hidden />
                  }
                  loading={restoreMutation.isPending}
                  onClick={handleRestore}
                >
                  Restore
                </Button>
              ) : null}
              {canArchive ? (
                <Button
                  size="xs"
                  variant="default"
                  color="red"
                  leftSection={<ArchiveIcon size={14} aria-hidden />}
                  loading={archiveMutation.isPending}
                  onClick={handleArchive}
                >
                  Archive
                </Button>
              ) : null}
            </Group>
          </Group>

          <Stack gap={6}>
            <Group justify="space-between">
              <Text size="xs" fw={500}>
                Overall progress
              </Text>
              <Text size="xs" c="dimmed">
                {progress.resolved}/{progress.total} resolved
              </Text>
            </Group>
            <Progress
              value={resolvedPct}
              size="sm"
              color={resolvedPct === 100 ? "green" : "blue"}
            />

            <Group justify="space-between">
              <Text size="xs" fw={500}>
                Required items
              </Text>
              <Text size="xs" c="dimmed">
                {progress.required_resolved}/{progress.required_total} resolved
              </Text>
            </Group>
            <Progress
              value={requiredPct}
              size="sm"
              color={requiredPct === 100 ? "green" : "orange"}
            />

            {progress.blocked > 0 ? (
              <Text size="xs" c="red">
                {progress.blocked} item(s) blocked — still outstanding
              </Text>
            ) : null}
          </Stack>

          {pendingItemIds ? (
            <Text size="xs" fw={500} c="red">
              Every required item must be resolved before completing — see the
              items highlighted below.
            </Text>
          ) : null}

          <Group justify="space-between">
            <Text size="sm" fw={500}>
              Items
            </Text>
            <Button
              size="xs"
              variant="light"
              leftSection={<PlusIcon size={14} aria-hidden />}
              onClick={() => setAddItemOpen(true)}
            >
              Add item
            </Button>
          </Group>

          <ChecklistItemsList
            checklist={checklist}
            outstandingIds={pendingItemIds ?? undefined}
          />
        </Stack>
      </ModalPaper>

      <AddChecklistItemModal
        checklistId={checklist.id}
        opened={addItemOpen}
        onClose={() => setAddItemOpen(false)}
      />
    </>
  );
}

export function ModuleChecklistDetail() {
  return (
    <RequireLeadAccess>
      <ChecklistDetailContent />
    </RequireLeadAccess>
  );
}

"use client";

import { useState } from "react";
import { Box, Modal, Tabs, modals } from "@peppermint/ui";
import { TagIcon } from "@phosphor-icons/react/dist/csr/Tag";
import { XCircleIcon } from "@phosphor-icons/react/dist/csr/XCircle";
import {
  useCreateLeadSource,
  useCreateLossReason,
  useLeadSourcesAdmin,
  useLossReasonsAdmin,
  useSetLeadSourceActive,
  useSetLossReasonActive,
  useUpdateLeadSource,
  useUpdateLossReason,
} from "../leadManagement.hooks";
import { ReferenceEntryPanel } from "./components/ReferenceEntryPanel";
import type { ReferenceEntryFormValues } from "./components/ReferenceEntryForm.types";
import type { ReferenceDataModalProps } from "./ReferenceDataModal.types";
import type { ReferenceEntryUpdatePayload } from "../leadManagement.types";

type ReferenceTab = "sources" | "loss-reasons";

/**
 * `ReferenceEntryFormValues` always carries `code` (the edit form shows it
 * read-only rather than mounting/unmounting the field) — the backend rejects
 * an update body that includes it at all, so it must be stripped here, not
 * merely typed away (`extends Record<string, unknown>` defeats excess-
 * property checking, so passing `values` straight through would compile).
 */
function toUpdatePayload(
  values: ReferenceEntryFormValues,
): ReferenceEntryUpdatePayload {
  return {
    name: values.name,
    requires_detail: values.requires_detail,
    display_order: values.display_order,
  };
}

interface TabPanelProps {
  onDraftStateChange: (hasDraft: boolean) => void;
}

function LeadSourcesTabPanel({ onDraftStateChange }: TabPanelProps) {
  const {
    data: entries = [],
    isLoading,
    isError,
    refetch,
  } = useLeadSourcesAdmin();
  const createMutation = useCreateLeadSource();
  const updateMutation = useUpdateLeadSource();
  const setActiveMutation = useSetLeadSourceActive();

  return (
    <ReferenceEntryPanel
      entityLabel="lead source"
      entries={entries}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => void refetch()}
      isCreating={createMutation.isPending}
      onCreate={(values) =>
        createMutation
          .mutateAsync(values)
          .then(() => ({ ok: true }))
          .catch(() => ({ ok: false }))
      }
      isUpdating={updateMutation.isPending}
      onUpdate={(id, values) =>
        updateMutation
          .mutateAsync({ id, body: toUpdatePayload(values) })
          .then(() => ({ ok: true }))
          .catch(() => ({ ok: false }))
      }
      onSetActive={(id, isActive) => setActiveMutation.mutate({ id, isActive })}
      settingActiveId={
        setActiveMutation.isPending
          ? (setActiveMutation.variables?.id ?? null)
          : null
      }
      isTogglingActive={setActiveMutation.isPending}
      onDraftStateChange={onDraftStateChange}
    />
  );
}

function LossReasonsTabPanel({ onDraftStateChange }: TabPanelProps) {
  const {
    data: entries = [],
    isLoading,
    isError,
    refetch,
  } = useLossReasonsAdmin();
  const createMutation = useCreateLossReason();
  const updateMutation = useUpdateLossReason();
  const setActiveMutation = useSetLossReasonActive();

  return (
    <ReferenceEntryPanel
      entityLabel="loss reason"
      entries={entries}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => void refetch()}
      isCreating={createMutation.isPending}
      onCreate={(values) =>
        createMutation
          .mutateAsync(values)
          .then(() => ({ ok: true }))
          .catch(() => ({ ok: false }))
      }
      isUpdating={updateMutation.isPending}
      onUpdate={(id, values) =>
        updateMutation
          .mutateAsync({ id, body: toUpdatePayload(values) })
          .then(() => ({ ok: true }))
          .catch(() => ({ ok: false }))
      }
      onSetActive={(id, isActive) => setActiveMutation.mutate({ id, isActive })}
      settingActiveId={
        setActiveMutation.isPending
          ? (setActiveMutation.variables?.id ?? null)
          : null
      }
      isTogglingActive={setActiveMutation.isPending}
      onDraftStateChange={onDraftStateChange}
    />
  );
}

/**
 * Admin-only (`FLOWS.md` "Configure the pickers") — the trigger that opens
 * this is hidden entirely from `lead_manager` at the call site
 * (`LeadManagementBoard.tsx`), not just disabled, per that flow's explicit
 * "hide this screen from non-Admins entirely" instruction.
 */
export function ReferenceDataModal({
  opened,
  onClose,
}: ReferenceDataModalProps) {
  const [activeTab, setActiveTab] = useState<ReferenceTab>("sources");
  const [sourcesHaveDraft, setSourcesHaveDraft] = useState(false);
  const [lossReasonsHaveDraft, setLossReasonsHaveDraft] = useState(false);

  const handleClose = () => {
    if (!sourcesHaveDraft && !lossReasonsHaveDraft) {
      onClose();
      return;
    }
    modals.openConfirmModal({
      title: "Discard changes?",
      children:
        "You have an unsaved lead source or loss reason draft. Closing now won't save it.",
      labels: { confirm: "Discard", cancel: "Keep editing" },
      confirmProps: { color: "red" },
      styles: { inner: { padding: "var(--mantine-spacing-md)" } },
      onConfirm: onClose,
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Reference data"
      size={640}
      radius="md"
      centered
    >
      <Box p="md">
        <Tabs
          value={activeTab}
          onChange={(value) =>
            setActiveTab((value as ReferenceTab | null) ?? "sources")
          }
        >
          <Tabs.List>
            <Tabs.Tab
              value="sources"
              leftSection={<TagIcon size={14} aria-hidden />}
            >
              Lead sources
            </Tabs.Tab>
            <Tabs.Tab
              value="loss-reasons"
              leftSection={<XCircleIcon size={14} aria-hidden />}
            >
              Loss reasons
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="sources" pt="md">
            <LeadSourcesTabPanel onDraftStateChange={setSourcesHaveDraft} />
          </Tabs.Panel>
          <Tabs.Panel value="loss-reasons" pt="md">
            <LossReasonsTabPanel onDraftStateChange={setLossReasonsHaveDraft} />
          </Tabs.Panel>
        </Tabs>
      </Box>
    </Modal>
  );
}

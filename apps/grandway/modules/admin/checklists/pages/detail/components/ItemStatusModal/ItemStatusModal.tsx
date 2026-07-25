"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  Textarea,
} from "@peppermint/ui";
import { PaperclipIcon } from "@phosphor-icons/react/dist/csr/Paperclip";
import { useUpdateItemStatus } from "../../../../checklists.hooks";
import { ITEM_STATUS_OPTIONS } from "../../../../checklists.labels";
import type { ItemStatus } from "../../../../checklists.types";
import { EvidencePickerModal } from "../EvidencePickerModal";
import type { ItemStatusModalProps } from "./ItemStatusModal.types";

const NOTE_REQUIRED = new Set<ItemStatus>(["waived", "blocked"]);

/**
 * The daily act (`POST /<id>/items/<item_id>/status/`) — the ONLY way an
 * item's status changes (the item PATCH is descriptive-only, §7).
 * `status_note` is required up front for `waived`/`blocked` (made a required
 * field on the option, not discovered by a `CHECKLISTS_STATUS_NOTE_REQUIRED`
 * failure). Evidence is optional and only ever relevant to a `document` item.
 * The response carries no `progress` — the mutation invalidates this
 * checklist's own detail key, which is the only way progress ever refreshes.
 */
export function ItemStatusModal({
  checklistId,
  applicantId,
  item,
  opened,
  onClose,
}: ItemStatusModalProps) {
  const [status, setStatus] = useState<ItemStatus>(item.status);
  const [statusNote, setStatusNote] = useState(item.status_note);
  const [evidenceFileId, setEvidenceFileId] = useState<string | null>(
    item.evidence_file,
  );
  const [clearEvidence, setClearEvidence] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const mutation = useUpdateItemStatus(checklistId);

  const needsNote = NOTE_REQUIRED.has(status);
  const canSubmit = !needsNote || statusNote.trim().length > 0;

  const handleClose = () => {
    setStatus(item.status);
    setStatusNote(item.status_note);
    setEvidenceFileId(item.evidence_file);
    setClearEvidence(false);
    onClose();
  };

  const handleSubmit = () => {
    mutation.mutate(
      {
        itemId: item.id,
        body: {
          status,
          ...(statusNote.trim() ? { status_note: statusNote.trim() } : {}),
          ...(clearEvidence
            ? { clear_evidence: true }
            : evidenceFileId && evidenceFileId !== item.evidence_file
              ? { evidence_file: evidenceFileId }
              : {}),
        },
      },
      { onSuccess: handleClose },
    );
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={handleClose}
        title="Update item status"
        centered
      >
        <Stack gap="md" p="md">
          <Text size="sm" fw={500}>
            {item.label}
          </Text>

          <Select
            label="New status"
            data={ITEM_STATUS_OPTIONS}
            allowDeselect={false}
            disabled={mutation.isPending}
            value={status}
            onChange={(value) =>
              setStatus((value ?? item.status) as ItemStatus)
            }
          />

          <Textarea
            label={needsNote ? "Note" : "Note (optional)"}
            placeholder="Why is this item being waived or blocked?"
            autosize
            minRows={2}
            required={needsNote}
            disabled={mutation.isPending}
            value={statusNote}
            onChange={(event) => setStatusNote(event.currentTarget.value)}
          />

          {item.item_type === "document" ? (
            <Stack gap={4}>
              <Text size="xs" fw={500}>
                Evidence
              </Text>
              {evidenceFileId && !clearEvidence ? (
                <Group gap="xs">
                  <Badge
                    size="xs"
                    variant="light"
                    color="teal"
                    leftSection={<PaperclipIcon size={12} aria-hidden />}
                  >
                    File attached
                  </Badge>
                  <Button
                    size="xs"
                    variant="subtle"
                    onClick={() => setPickerOpen(true)}
                    disabled={mutation.isPending}
                  >
                    Change
                  </Button>
                  <Button
                    size="xs"
                    variant="subtle"
                    color="red"
                    onClick={() => setClearEvidence(true)}
                    disabled={mutation.isPending}
                  >
                    Remove
                  </Button>
                </Group>
              ) : (
                <Button
                  size="xs"
                  variant="light"
                  leftSection={<PaperclipIcon size={14} aria-hidden />}
                  onClick={() => setPickerOpen(true)}
                  disabled={mutation.isPending}
                >
                  Attach evidence
                </Button>
              )}
            </Stack>
          ) : null}

          <Group justify="flex-end" gap="xs">
            <Button
              variant="default"
              size="xs"
              onClick={handleClose}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              size="xs"
              loading={mutation.isPending}
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              Update status
            </Button>
          </Group>
        </Stack>
      </Modal>

      <EvidencePickerModal
        applicantId={applicantId}
        opened={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(fileId) => {
          setEvidenceFileId(fileId);
          setClearEvidence(false);
          setPickerOpen(false);
        }}
      />
    </>
  );
}

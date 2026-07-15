"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  Textarea,
} from "@peppermint/ui";

import {
  CASE_REASON_REQUIRED,
  CASE_STATUS_LABELS,
  caseKeys,
  useApplicantMutation,
} from "../../_shared";
import type { ApplicationCase, CaseStatus } from "../../_shared";
import { transitionCase } from "../cases.api";
import type { CaseTransitionPayload } from "../cases.api";

interface CaseTransitionModalProps {
  kase: ApplicationCase;
  opened: boolean;
  onClose: () => void;
}

/**
 * Change an application case's status (§10.3). The status graph isn't rigidly encoded,
 * so any other status is selectable; a reason is required into visa_refused / withdrawn
 * / archived, and the case's own record_version guards the write.
 */
export function CaseTransitionModal({
  kase,
  opened,
  onClose,
}: CaseTransitionModalProps) {
  const [status, setStatus] = useState<string>("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const reset = () => {
    setStatus("");
    setReason("");
    setNotes("");
  };
  const handleClose = () => {
    reset();
    onClose();
  };

  const mutation = useApplicantMutation<ApplicationCase, CaseTransitionPayload>(
    {
      mutationFn: (payload) => transitionCase(kase.id, payload),
      successTitle: "Case updated",
      successMessage: "The status change was recorded.",
      errorTitle: "Couldn't update case",
      invalidateKeys: [
        caseKeys.detail(kase.id),
        ["applicant.case-status-history", kase.id],
        caseKeys.lists(),
      ],
      onSuccess: handleClose,
    },
  );

  const options = (Object.keys(CASE_STATUS_LABELS) as CaseStatus[])
    .filter((s) => s !== kase.case_status)
    .map((s) => ({ value: s, label: CASE_STATUS_LABELS[s] }));

  const reasonRequired = Boolean(
    status && CASE_REASON_REQUIRED.includes(status as CaseStatus),
  );
  const disabled = !status || (reasonRequired && !reason.trim());

  const handleSubmit = () => {
    if (!status) return;
    const payload: CaseTransitionPayload = {
      into_status: status as CaseStatus,
      record_version: kase.record_version,
    };
    if (reason.trim()) payload.reason = reason.trim();
    if (notes.trim()) payload.notes = notes.trim();
    mutation.mutate(payload);
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Change case status"
      centered
    >
      <Stack gap="sm">
        <Text size="xs" c="dimmed">
          Current: {CASE_STATUS_LABELS[kase.case_status]}
        </Text>
        <Select
          label="New status"
          placeholder="Select a status"
          data={options}
          value={status}
          onChange={(v) => setStatus(v ?? "")}
        />
        <Textarea
          label="Reason"
          required={reasonRequired}
          autosize
          minRows={2}
          value={reason}
          onChange={(e) => setReason(e.currentTarget.value)}
        />
        <Textarea
          label="Notes"
          autosize
          minRows={2}
          value={notes}
          onChange={(e) => setNotes(e.currentTarget.value)}
        />
        {reasonRequired && (
          <Alert color="orange" variant="light" py="xs">
            A reason is required for this status.
          </Alert>
        )}
        <Group justify="flex-end" gap="xs">
          <Button variant="default" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={mutation.isPending}
            disabled={disabled}
          >
            Apply
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

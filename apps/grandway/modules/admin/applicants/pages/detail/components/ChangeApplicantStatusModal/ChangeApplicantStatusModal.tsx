"use client";

import { useState } from "react";
import { Button, Group, Modal, Select, Stack, Text } from "@peppermint/ui";
import { useChangeApplicantStatus } from "../../../../applicants.hooks";
import type { ApplicantStatus } from "../../../../applicants.types";
import type { ChangeApplicantStatusModalProps } from "./ChangeApplicantStatusModal.types";

const STATUS_OPTIONS: { value: ApplicantStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "dormant", label: "Dormant" },
  { value: "archived", label: "Archived" },
];

const STATUS_LABELS: Record<ApplicantStatus, string> = {
  active: "Active",
  dormant: "Dormant",
  archived: "Archived",
};

/**
 * The only place status changes — never a form field
 * (`docs/backend/applicants/CONCEPT.md`: "Set manually — never as a side
 * effect"). Archiving is reversible and touches nothing else: open journeys
 * stay open either way (`docs/backend/applicants/FLOWS.md` "Wind a file down
 * and revive it").
 */
export function ChangeApplicantStatusModal({
  applicant,
  opened,
  onClose,
}: ChangeApplicantStatusModalProps) {
  const [status, setStatus] = useState<ApplicantStatus | null>(null);
  const mutation = useChangeApplicantStatus(applicant.id);

  const handleClose = () => {
    setStatus(null);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={`Change status — ${
        applicant.full_name || applicant.full_name_en || applicant.full_name_np
      }`}
      centered
    >
      <Stack gap="md" p="md">
        <Text size="xs" c="dimmed">
          Nothing else changes — open journeys stay open regardless of status.
        </Text>
        <Select
          label="New status"
          placeholder={STATUS_LABELS[applicant.status]}
          data={STATUS_OPTIONS}
          required
          disabled={mutation.isPending}
          value={status}
          onChange={(value) => setStatus(value as ApplicantStatus)}
        />

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
            disabled={!status}
            onClick={() =>
              mutation.mutate(
                { status: status as ApplicantStatus },
                { onSuccess: handleClose },
              )
            }
          >
            Update status
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

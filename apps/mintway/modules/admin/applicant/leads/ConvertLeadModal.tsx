"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
} from "@peppermint/ui";
import { WarningCircleIcon } from "@phosphor-icons/react/dist/csr/WarningCircle";

import { applicantKeys, leadKeys, useApplicantMutation } from "../_shared";
import type { DuplicateMatch } from "../_shared";
import { convertLead } from "./leads.api";
import type { Lead, LeadConvertPayload } from "./leads.types";
import type { LeadConvertResult } from "./leads.api";

interface ConvertLeadModalProps {
  lead: Lead;
  opened: boolean;
  onClose: () => void;
  /** Surfaces the non-blocking duplicate warning the convert response may carry. */
  onDuplicates: (matches: DuplicateMatch[]) => void;
}

/**
 * Convert an enquiry into an applicant. **Admin only**, and irreversible: the
 * server creates the applicant plus an address, identity document and interest
 * profile, then freezes the lead. The consequence is stated in the modal rather
 * than implied, and the action needs a deliberate target country — which is also
 * what seeds the new applicant's interest profile.
 */
export function ConvertLeadModal({
  lead,
  opened,
  onClose,
  onDuplicates,
}: ConvertLeadModalProps) {
  const router = useRouter();
  const [targetCountry, setTargetCountry] = useState("");

  const handleClose = () => {
    setTargetCountry("");
    onClose();
  };

  const mutation = useApplicantMutation<LeadConvertResult, LeadConvertPayload>({
    mutationFn: async (payload) => {
      const { data, meta } = await convertLead(lead.id, payload);
      if (meta.possible_duplicate && meta.matches?.length) {
        onDuplicates(meta.matches);
      }
      return data;
    },
    successTitle: "Lead converted",
    successMessage: `${lead.full_name || lead.first_name} is now an applicant.`,
    errorTitle: "Couldn't convert lead",
    invalidateKeys: [leadKeys.lists(), applicantKeys.lists()],
    onSuccess: (result) => {
      handleClose();
      // Land the operator on what they just created rather than back on the list.
      router.push(`/admin/applicants/${result.applicant.id}`);
    },
  });

  const canSubmit = targetCountry.trim().length > 0;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Convert to applicant"
      centered
    >
      <Stack gap="md" p="md">
        <Alert
          variant="light"
          color="orange"
          icon={<WarningCircleIcon size={16} aria-hidden />}
          title="This can't be undone"
        >
          <Text size="xs">
            Creates an applicant at stage <strong>Interested</strong>, carrying
            over the name, contact, date of birth, payment preference and lead
            source. The address and passport number become an address and an
            identity document. This enquiry is then frozen and can no longer be
            edited.
          </Text>
        </Alert>

        <TextInput
          label="Target country"
          description="Seeds the new applicant's interest profile."
          placeholder="e.g. Australia"
          withAsterisk
          disabled={mutation.isPending}
          value={targetCountry}
          onChange={(e) => setTargetCountry(e.currentTarget.value)}
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
            disabled={!canSubmit}
            onClick={() =>
              mutation.mutate({
                target_country: targetCountry.trim(),
                // Optional on convert, but sending it means a concurrent edit
                // surfaces as a version conflict instead of silently winning.
                record_version: lead.record_version,
              })
            }
          >
            Convert
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

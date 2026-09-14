"use client";

import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  notifications,
} from "@peppermint/ui";
import { ArrowsLeftRightIcon } from "@phosphor-icons/react/dist/csr/ArrowsLeftRight";
import { getApiError, getApiErrorMessage } from "@/lib/authErrorMessages";
import { getLead } from "../../../../leadManagement.api";
import { useConvertLead } from "../../../../leadManagement.hooks";
import type { ConvertLeadModalProps } from "./ConvertLeadModal.types";

/**
 * Admin only (`LeadRowActionsMenu` hides this action for a Lead Manager).
 * Empty request body — the backend creates the applicant and a seed journey
 * in one step and returns both ids directly, so there's nothing to fetch
 * after success, only where to navigate
 * (`docs/backend/lead-management/FLOWS.md` "Convert a lead into a client").
 */
export function ConvertLeadModal({
  lead,
  opened,
  onClose,
}: ConvertLeadModalProps) {
  const router = useRouter();
  const mutation = useConvertLead(lead.id);
  const displayName = lead.full_name;

  const handleConvert = () => {
    mutation.mutate(undefined, {
      onSuccess: (data) => {
        notifications.show({
          color: "green",
          message: `${displayName} converted to an applicant.`,
        });
        onClose();
        router.push(`/admin/applicants/${data.applicant_id}`);
      },
      onError: async (error) => {
        // Someone else converted this lead a moment ago (a race between two
        // Admins acting on the same stale board row — the row menu already
        // hides Convert once `stage` reads `converted`, so this only fires
        // when the board's cached data was behind). Not a real failure from
        // the user's point of view — the applicant they wanted already
        // exists — so this shows an informational toast and navigates
        // instead of a red error. The board's own row is always
        // list-shape-padded with `converted_applicant_id: null`
        // (`toLeadBoardRow`), so re-fetch the real lead to get the id that
        // already exists, rather than navigating with a value we know is null.
        if (getApiError(error).code === "LEADS_LEAD_ALREADY_CONVERTED") {
          const current = await getLead(lead.id).catch(() => null);
          if (current?.converted_applicant_id) {
            notifications.show({
              color: "blue",
              message: `${displayName} was already converted — opening the applicant.`,
            });
            onClose();
            router.push(`/admin/applicants/${current.converted_applicant_id}`);
            return;
          }
        }
        notifications.show({
          color: "red",
          title: "Couldn't convert lead",
          message: getApiErrorMessage(error),
        });
      },
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Convert to applicant — ${displayName}`}
      centered
    >
      <Stack gap="md" p="md">
        <Alert
          variant="light"
          color="blue"
          icon={<ArrowsLeftRightIcon size={16} aria-hidden />}
          title="Creates an applicant and a starting study objective"
        >
          <Text size="sm">
            This lead moves to <b>Converted</b> — a terminal stage reachable
            only by reopening first. Identity and contact details carry over to
            the new applicant; a journey is seeded from this lead&apos;s study
            interest.
          </Text>
        </Alert>

        <Group justify="flex-end" gap="xs">
          <Button
            variant="default"
            size="xs"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            size="xs"
            loading={mutation.isPending}
            onClick={handleConvert}
          >
            Convert to applicant
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

"use client";

import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Group,
  List,
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
 * Admin only (`LeadStageSwitch` hides this action for a Lead Manager).
 * Empty request body — the backend creates the applicant and a seed journey
 * in one step and returns both ids directly, so there's nothing to fetch
 * after success, only where to navigate
 * (`docs/backend/lead-management/FLOWS.md` "Convert a lead into a client").
 * The copy lists what conversion carries over as of 2026-10-29 (notes,
 * education record, language tests, owner assignment) and that the lead's
 * notes turn read-only (`INTEGRATION.md` §7 convert).
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
          <Stack gap={6}>
            <Text size="sm">
              This lead moves to <b>Converted</b> — a terminal stage reachable
              only by reopening first.
            </Text>
            <List size="sm" spacing={2}>
              <List.Item>
                Name, email, contact numbers, address and every note carry over
                to the new applicant.
              </List.Item>
              <List.Item>
                The highest qualification becomes an education record (when its
                level is set), and each language certificate becomes a language
                test.
              </List.Item>
              <List.Item>
                The applicant is assigned to this lead&apos;s owner, and a
                journey is seeded from the study interest.
              </List.Item>
            </List>
            <Text size="sm">
              From then on this lead&apos;s notes are read-only — keep writing
              them on the applicant.
            </Text>
          </Stack>
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

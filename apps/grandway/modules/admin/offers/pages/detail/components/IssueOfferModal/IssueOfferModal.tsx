"use client";

import { Alert, Button, Group, Modal, Stack, Text } from "@peppermint/ui";
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info";
import { useIssueOffer } from "../../../../offers.hooks";
import type { IssueOfferModalProps } from "./IssueOfferModal.types";

/**
 * Issue is the sole transition draft → issued (§7); it requires a `draft` and
 * has an empty body. Once issued the offer is "awaiting a response" — there is
 * no separate `awaiting_response` status.
 */
export function IssueOfferModal({
  offer,
  opened,
  onClose,
}: IssueOfferModalProps) {
  const mutation = useIssueOffer(offer.id);

  return (
    <Modal opened={opened} onClose={onClose} title="Issue this offer" centered>
      <Stack gap="md" p="md">
        <Alert
          variant="light"
          color="blue"
          icon={<InfoIcon size={16} aria-hidden />}
          title="Marks the offer as sent to the applicant"
        >
          The offer moves from draft to issued and its response deadline starts
          counting. You can still add conditions afterwards.
        </Alert>
        <Text size="sm">
          Issue the offer to{" "}
          <Text span fw={600}>
            {offer.applicant_name}
          </Text>
          ?
        </Text>
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
            onClick={() => mutation.mutate(undefined, { onSuccess: onClose })}
          >
            Issue offer
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

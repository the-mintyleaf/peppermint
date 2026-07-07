"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Group,
  Modal,
  Stack,
  Text,
  modals,
  useDisclosure,
} from "@peppermint/ui";
import { formatRelative } from "@peppermint/utils";

import { BilingualName } from "@/modules/admin/organization/_shared/components/BilingualName";
import { MembershipStatusBadge } from "@/modules/admin/organization/_shared/components/MembershipStatusBadge";
import { ReasonTextarea } from "@/modules/admin/organization/_shared/components/ReasonTextarea";

import {
  useAcceptInvitation,
  useDeclineInvitation,
} from "../../Invitations.hooks";
import type { InvitationCardProps } from "./InvitationCard.types";

export function InvitationCard({ membership }: InvitationCardProps) {
  const [declineOpened, { open: openDecline, close: closeDecline }] =
    useDisclosure(false);
  const [reason, setReason] = useState("");
  const accept = useAcceptInvitation();
  const decline = useDeclineInvitation();

  const busy = accept.isPending || decline.isPending;
  const { organization } = membership;

  const handleAccept = () =>
    modals.openConfirmModal({
      title: "Accept invitation",
      children: (
        <Text size="sm">
          Join {organization.name_np}? You&apos;ll become a member of this
          organization.
        </Text>
      ),
      labels: { confirm: "Accept", cancel: "Cancel" },
      confirmProps: { color: "green" },
      onConfirm: () => accept.mutate(membership.id),
    });

  const handleDecline = () =>
    decline.mutate(
      { membershipId: membership.id, reason: reason.trim() || undefined },
      {
        onSuccess: () => {
          closeDecline();
          setReason("");
        },
      },
    );

  return (
    <Card withBorder radius="md" p="lg">
      <Stack gap="md">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Stack gap={4} style={{ minWidth: 0 }}>
            <Text
              size="xs"
              tt="uppercase"
              c="dimmed"
              style={{ letterSpacing: "0.05em" }}
            >
              {organization.organization_type}
            </Text>
            <BilingualName
              np={organization.name_np}
              en={organization.name_en}
              size="md"
              fw={700}
            />
            <Text size="xs" c="dimmed">
              {organization.code}
              {membership.employee_code ? ` · ${membership.employee_code}` : ""}
            </Text>
          </Stack>
          <MembershipStatusBadge status={membership.membership_status} />
        </Group>

        {membership.invited_at && (
          <Text size="xs" c="dimmed">
            Invited {formatRelative(membership.invited_at)}
          </Text>
        )}

        <Group justify="flex-end" gap="sm">
          <Button
            size="xs"
            variant="default"
            onClick={openDecline}
            disabled={busy}
          >
            Decline
          </Button>
          <Button
            size="xs"
            color="green"
            onClick={handleAccept}
            loading={accept.isPending}
            disabled={decline.isPending}
          >
            Accept
          </Button>
        </Group>
      </Stack>

      <Modal
        opened={declineOpened}
        onClose={closeDecline}
        title="Decline invitation"
      >
        <Stack gap="md" p="md">
          <Text size="sm" c="dimmed">
            Decline the invitation from {organization.name_np}? You can add an
            optional reason.
          </Text>
          <ReasonTextarea
            value={reason}
            onChange={setReason}
            placeholder="e.g. Joined a different unit."
          />
          <Button
            fullWidth
            color="red"
            loading={decline.isPending}
            onClick={handleDecline}
          >
            Decline invitation
          </Button>
        </Stack>
      </Modal>
    </Card>
  );
}

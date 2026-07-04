"use client";

import { useState } from "react";
import {
  Button,
  Modal,
  Select,
  Stack,
  notifications,
  useDisclosure,
  useMutation,
  useQueryClient,
} from "@peppermint/ui";

import { getApiErrorMessage } from "@/lib/authErrorMessages";

import { ReasonTextarea } from "../../../../../_shared/components/ReasonTextarea";
import { changeMembershipStatus } from "../../../../members.api";
import { membersQueryKeys } from "../../../../members.queryKeys";
import type { MembershipStatus } from "../../../../members.types";
import type { MemberStatusMenuProps } from "./MemberStatusMenu.types";

const STATUS_OPTIONS = [
  { value: "invited", label: "Invited" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
  { value: "transferred", label: "Transferred" },
  { value: "ended", label: "Ended" },
  { value: "archived", label: "Archived" },
];

export function MemberStatusMenu({ membership }: MemberStatusMenuProps) {
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [status, setStatus] = useState<MembershipStatus>(
    membership.membership_status,
  );
  const [reason, setReason] = useState("");

  const mutation = useMutation({
    mutationFn: () => changeMembershipStatus(membership.id, { status, reason }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: membersQueryKeys.detail(membership.id),
      });
      notifications.show({
        color: "green",
        title: "Status updated",
        message: `Membership status changed to "${status}".`,
      });
      close();
      setReason("");
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Couldn't update status",
        message: getApiErrorMessage(error),
      });
    },
  });

  function handleOpen() {
    setStatus(membership.membership_status);
    setReason("");
    open();
  }

  const isEnding = status === "ended";

  return (
    <>
      <Button size="xs" variant="light" onClick={handleOpen}>
        Change Status
      </Button>
      <Modal opened={opened} onClose={close} title="Change Membership Status">
        <Stack gap="md" p="md">
          <Select
            label="Status"
            data={STATUS_OPTIONS}
            value={status}
            onChange={(value) => value && setStatus(value as MembershipStatus)}
            disabled={mutation.isPending}
          />
          <ReasonTextarea
            value={reason}
            onChange={setReason}
            required
            placeholder={
              isEnding
                ? "e.g. Employment ended."
                : "e.g. Activated after invitation acceptance."
            }
          />
          <Button
            fullWidth
            color={isEnding ? "red" : undefined}
            loading={mutation.isPending}
            disabled={!reason.trim()}
            onClick={() => mutation.mutate()}
          >
            Confirm
          </Button>
        </Stack>
      </Modal>
    </>
  );
}

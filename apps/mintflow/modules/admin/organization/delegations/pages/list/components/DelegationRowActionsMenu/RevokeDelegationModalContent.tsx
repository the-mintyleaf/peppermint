"use client";

import { useState } from "react";
import {
  Button,
  Stack,
  modals,
  notifications,
  useMutation,
  useQueryClient,
} from "@peppermint/ui";

import { getApiErrorMessage } from "@/lib/authErrorMessages";

import { ReasonTextarea } from "../../../../../_shared/components/ReasonTextarea";
import { revokeDelegation } from "../../../../delegations.api";

export function RevokeDelegationModalContent({
  delegationId,
}: {
  delegationId: string;
}) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");

  const mutation = useMutation({
    mutationFn: () => revokeDelegation(delegationId, { reason }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["delegations"] });
      notifications.show({ color: "green", message: "Delegation revoked." });
      modals.closeAll();
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Couldn't revoke delegation",
        message: getApiErrorMessage(error),
      });
    },
  });

  return (
    <Stack gap="md">
      <ReasonTextarea
        value={reason}
        onChange={setReason}
        required
        placeholder="e.g. Director returned early."
      />
      <Button
        fullWidth
        color="red"
        loading={mutation.isPending}
        disabled={!reason.trim()}
        onClick={() => mutation.mutate()}
      >
        Revoke Delegation
      </Button>
    </Stack>
  );
}

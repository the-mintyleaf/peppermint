"use client";

import { useMutation } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Stack,
  Text,
  modals,
  notifications,
} from "@peppermint/ui";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { ShieldWarningIcon } from "@phosphor-icons/react/dist/csr/ShieldWarning";

import { getApiErrorMessage } from "@/lib/authErrorMessages";

import { resetUserMfa } from "../../../../../../users.api";
import type { MfaTabProps } from "./MfaTab.types";

export function MfaTab({ userId }: MfaTabProps) {
  const resetMutation = useMutation({
    mutationFn: () => resetUserMfa(userId),
    onSuccess: () => {
      notifications.show({ color: "green", message: "MFA reset." });
    },
    onError: (error) =>
      notifications.show({ color: "red", message: getApiErrorMessage(error) }),
  });

  const handleReset = () => {
    modals.openConfirmModal({
      title: "Reset MFA",
      children: (
        <Text size="sm">
          Removes this user&apos;s MFA device. They&apos;ll need to re-enroll.
          Does not clear any staff-mandated MFA policy.
        </Text>
      ),
      labels: { confirm: "Reset MFA", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => resetMutation.mutate(),
    });
  };

  return (
    <Stack gap="md">
      <Alert color="gray" icon={<ShieldWarningIcon size={18} aria-hidden />}>
        There&apos;s no endpoint to read this user&apos;s MFA enrollment status
        — only the reset action is available here.
      </Alert>
      <Button
        color="red"
        variant="light"
        leftSection={<ArrowCounterClockwiseIcon size={14} aria-hidden />}
        loading={resetMutation.isPending}
        onClick={handleReset}
      >
        Reset MFA
      </Button>
    </Stack>
  );
}

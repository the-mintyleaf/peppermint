"use client";

import { Modal, Stack, Text } from "@peppermint/ui";
import { ChangePasswordForm } from "@/modules/auth/_shared/ChangePasswordForm";
import type { AccountModalProps } from "./AccountModal.types";

/**
 * Account settings for the signed-in user. Scope is deliberately narrow — the
 * client app only exposes the own-password change; profile, MFA, sessions, and
 * permissions are managed in mintflow-admin.
 */
export function AccountModal({ opened, onClose }: AccountModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Change password"
      centered
      radius="md"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Changing your password signs you out of other devices.
        </Text>
        <ChangePasswordForm onSuccess={onClose} />
      </Stack>
    </Modal>
  );
}

"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Group,
  Modal,
  PasswordInput,
  Stack,
  Text,
} from "@peppermint/ui";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { PASSWORD_MIN_LENGTH } from "@/modules/admin/authenticate/_shared/password";
import type { SetTemporaryPasswordModalProps } from "./SetTemporaryPasswordModal.types";

/**
 * Prompts for a temporary password when a superadmin resets an account. The account is
 * forced to change it on next sign-in. The value is validated for length only — the
 * backend enforces the full policy and history rules.
 */
export function SetTemporaryPasswordModal({
  opened,
  onClose,
  username,
  isSubmitting,
  onConfirm,
}: SetTemporaryPasswordModalProps) {
  const [value, setValue] = useState("");
  const tooShort = value.length > 0 && value.length < PASSWORD_MIN_LENGTH;

  const handleClose = () => {
    setValue("");
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Reset password"
      centered
      // Restore body padding — the app zeroes Modal body padding globally.
      styles={{ body: { padding: "var(--mantine-spacing-md)" } }}
    >
      <Stack gap="md">
        <Alert
          color="yellow"
          icon={<WarningIcon size={18} weight="fill" aria-hidden />}
          title="This forces a password change"
        >
          <Text size="xs">
            You&apos;re setting a temporary password for @{username}. They must
            change it the next time they sign in, and all their active sessions
            are revoked immediately.
          </Text>
        </Alert>
        <PasswordInput
          label="Temporary password"
          placeholder={`At least ${PASSWORD_MIN_LENGTH} characters`}
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
          error={tooShort ? `At least ${PASSWORD_MIN_LENGTH} characters` : null}
          disabled={isSubmitting}
          required
        />
        <Group justify="flex-end">
          <Button
            variant="default"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            color="red"
            loading={isSubmitting}
            disabled={value.length < PASSWORD_MIN_LENGTH}
            onClick={() => onConfirm(value)}
          >
            Reset password
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

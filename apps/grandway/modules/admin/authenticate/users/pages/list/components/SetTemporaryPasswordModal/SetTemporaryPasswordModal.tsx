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
import { ShellModalHeader } from "@peppermint/admin";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { PASSWORD_MIN_LENGTH } from "@/modules/admin/authenticate/_shared/password";
import type { SetTemporaryPasswordModalProps } from "./SetTemporaryPasswordModal.types";

/**
 * Prompts for a temporary password when resetting an account
 * (`POST /users/<id>/reset-password/`, API §7). Leave blank to let the server
 * auto-generate one — either way the account must change it at next login and every
 * active session is revoked immediately.
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
      centered
      withCloseButton={false}
      padding={0}
    >
      <ShellModalHeader
        parentLabel="Users"
        currentLabel="Reset password"
        onClose={handleClose}
      />
      <Stack gap="md" p="md">
        <Alert
          color="yellow"
          icon={<WarningIcon size={18} weight="fill" aria-hidden />}
          title="This forces a password change"
        >
          <Text size="xs">
            @{username} must change this password the next time they sign in,
            and all their active sessions are revoked immediately.
          </Text>
        </Alert>
        <PasswordInput
          label="Temporary password"
          placeholder="Leave blank to auto-generate"
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
          error={tooShort ? `At least ${PASSWORD_MIN_LENGTH} characters` : null}
          disabled={isSubmitting}
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
            disabled={tooShort}
            onClick={() => onConfirm(value || undefined)}
          >
            Reset password
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

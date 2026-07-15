"use client";

import {
  Alert,
  Button,
  CopyButton,
  Group,
  Modal,
  Stack,
  Text,
} from "@peppermint/ui";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { CopyIcon } from "@phosphor-icons/react/dist/csr/Copy";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import type { OneTimeSecretModalProps } from "./OneTimeSecretModal.types";

export function OneTimeSecretModal({
  opened,
  onClose,
  title,
  description,
  secrets,
}: OneTimeSecretModalProps) {
  const joined = secrets.join("\n");

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <Stack gap="md">
        <Alert
          color="yellow"
          icon={<WarningIcon size={18} weight="fill" aria-hidden />}
        >
          {description} This is shown once and cannot be retrieved again — copy
          it now.
        </Alert>

        <Stack
          gap={4}
          p="sm"
          bg="var(--mantine-color-default-hover)"
          style={{ borderRadius: 6 }}
        >
          {secrets.map((secret) => (
            <Text key={secret} ff="monospace" size="sm">
              {secret}
            </Text>
          ))}
        </Stack>

        <Group justify="flex-end">
          <CopyButton value={joined}>
            {({ copied, copy }) => (
              <Button
                leftSection={
                  copied ? (
                    <CheckIcon size={16} aria-hidden />
                  ) : (
                    <CopyIcon size={16} aria-hidden />
                  )
                }
                color={copied ? "teal" : undefined}
                onClick={copy}
              >
                {copied ? "Copied" : "Copy to clipboard"}
              </Button>
            )}
          </CopyButton>
          <Button variant="default" onClick={onClose}>
            I&apos;ve saved this — close
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

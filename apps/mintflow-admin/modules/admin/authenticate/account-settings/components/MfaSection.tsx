"use client";

import { QRCodeSVG } from "qrcode.react";
import {
  Badge,
  Box,
  Button,
  CopyButton,
  Group,
  Stack,
  Text,
  TextInput,
} from "@peppermint/ui";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { CopyIcon } from "@phosphor-icons/react/dist/csr/Copy";
import { OneTimeSecretModal } from "@/modules/admin/authenticate/_shared/OneTimeSecretModal";
import { SettingsRow } from "./SettingsRow";
import { SettingsSubScreen } from "./SettingsSubScreen";
import type { MfaSectionState } from "./MfaSection.hooks";

interface MfaSectionProps {
  mfa: MfaSectionState;
}

export function MfaSection({ mfa }: MfaSectionProps) {
  const statusBadge =
    mfa.status === "enrolled" ? (
      <Badge color="green" variant="light" size="sm">
        Enabled
      </Badge>
    ) : (
      <Badge color="gray" variant="light" size="sm">
        Not confirmed
      </Badge>
    );

  return (
    <>
      {mfa.screen === "idle" && (
        <Stack gap="sm">
          <SettingsRow
            label="Two-factor authentication"
            description={
              mfa.status === "enrolled"
                ? "On for this session. Regenerate your recovery codes or turn it off."
                : "Require a one-time code from an authenticator app when you sign in."
            }
            right={statusBadge}
          />
          {mfa.status === "enrolled" ? (
            <Group gap="xs">
              <Button
                size="xs"
                variant="default"
                onClick={mfa.requestRegenerate}
                loading={mfa.isRegenerating}
              >
                Regenerate recovery codes
              </Button>
              <Button
                size="xs"
                color="red"
                variant="light"
                onClick={mfa.requestDisable}
                loading={mfa.isDisabling}
              >
                Disable MFA
              </Button>
            </Group>
          ) : (
            <Group gap="xs">
              <Button
                size="xs"
                onClick={mfa.startSetup}
                loading={mfa.isStartingSetup}
              >
                Set up MFA
              </Button>
            </Group>
          )}
        </Stack>
      )}

      {mfa.screen === "setup" && mfa.setupData && (
        <SettingsSubScreen
          title="Set up two-factor authentication"
          onBack={mfa.cancelSetup}
        >
          <Stack gap="md">
            <Text size="xs">
              Scan this QR code with your authenticator app, or enter the setup
              key manually.
            </Text>
            <Box
              bg="white"
              p="sm"
              w="fit-content"
              style={{ borderRadius: 8, alignSelf: "center" }}
            >
              <QRCodeSVG value={mfa.setupData.provisioning_uri} size={176} />
            </Box>
            <Stack gap={4}>
              <Text size="xs" c="dimmed">
                Setup key
              </Text>
              <Group gap="xs" wrap="nowrap">
                <Text
                  ff="monospace"
                  size="xs"
                  style={{ wordBreak: "break-all" }}
                >
                  {mfa.setupData.secret}
                </Text>
                <CopyButton value={mfa.setupData.secret}>
                  {({ copied, copy }) => (
                    <Button
                      size="compact-xs"
                      variant="subtle"
                      color={copied ? "teal" : undefined}
                      onClick={copy}
                      leftSection={
                        copied ? (
                          <CheckIcon size={14} aria-hidden />
                        ) : (
                          <CopyIcon size={14} aria-hidden />
                        )
                      }
                    >
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  )}
                </CopyButton>
              </Group>
            </Stack>
            <Group justify="flex-end">
              <Button size="xs" variant="default" onClick={mfa.cancelSetup}>
                Cancel
              </Button>
              <Button size="xs" onClick={mfa.goToConfirm}>
                Continue
              </Button>
            </Group>
          </Stack>
        </SettingsSubScreen>
      )}

      {mfa.screen === "confirm" && (
        <SettingsSubScreen
          title="Set up two-factor authentication"
          onBack={mfa.cancelSetup}
        >
          <Stack gap="md">
            <Text size="xs">
              Enter the 6-digit code from your authenticator app to finish
              enabling MFA.
            </Text>
            <TextInput
              label="Authentication code"
              size="xs"
              placeholder="123456"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={mfa.code}
              onChange={(event) => mfa.setCode(event.currentTarget.value)}
              disabled={mfa.isConfirming}
            />
            <Group justify="flex-end">
              <Button size="xs" variant="default" onClick={mfa.cancelSetup}>
                Cancel
              </Button>
              <Button
                size="xs"
                onClick={mfa.confirmSetup}
                loading={mfa.isConfirming}
                disabled={mfa.code.trim().length === 0}
              >
                Confirm
              </Button>
            </Group>
          </Stack>
        </SettingsSubScreen>
      )}

      <OneTimeSecretModal
        opened={mfa.recoveryModal.opened}
        onClose={mfa.closeRecoveryModal}
        title="Your recovery codes"
        description="Store these somewhere safe — each code can be used once if you lose access to your authenticator."
        secrets={mfa.recoveryModal.codes}
      />
    </>
  );
}

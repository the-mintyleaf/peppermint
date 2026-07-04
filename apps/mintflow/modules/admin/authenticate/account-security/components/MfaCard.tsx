"use client";

import { QRCodeSVG } from "qrcode.react";
import {
  Badge,
  Box,
  Button,
  Card,
  CopyButton,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from "@peppermint/ui";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { CopyIcon } from "@phosphor-icons/react/dist/csr/Copy";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/csr/ShieldCheck";
import { OneTimeSecretModal } from "@/modules/admin/authenticate/_shared/OneTimeSecretModal";
import { useMfaCard } from "./MfaCard.hooks";

export function MfaCard() {
  const mfa = useMfaCard();

  return (
    <Card withBorder radius="md" p="lg">
      <Stack gap="md">
        <Group gap="xs" justify="space-between">
          <Group gap="xs">
            <ShieldCheckIcon size={20} aria-hidden />
            <Title order={4}>Two-factor authentication</Title>
          </Group>
          {mfa.status === "enrolled" ? (
            <Badge color="green" variant="light">
              Enabled
            </Badge>
          ) : (
            <Badge color="gray" variant="light">
              Not confirmed
            </Badge>
          )}
        </Group>

        {mfa.screen === "idle" && (
          <Stack gap="md">
            {mfa.status === "enrolled" ? (
              <>
                <Text size="sm" c="dimmed">
                  Two-factor authentication is on for this session. You can
                  regenerate your recovery codes or turn it off below.
                </Text>
                <Group>
                  <Button
                    variant="default"
                    onClick={mfa.requestRegenerate}
                    loading={mfa.isRegenerating}
                  >
                    Regenerate recovery codes
                  </Button>
                  <Button
                    color="red"
                    variant="light"
                    onClick={mfa.requestDisable}
                    loading={mfa.isDisabling}
                  >
                    Disable MFA
                  </Button>
                </Group>
              </>
            ) : (
              <>
                <Text size="sm" c="dimmed">
                  Add an extra layer of security by requiring a one-time code
                  from an authenticator app when you sign in.
                </Text>
                <Group>
                  <Button
                    onClick={mfa.startSetup}
                    loading={mfa.isStartingSetup}
                  >
                    Set up MFA
                  </Button>
                </Group>
              </>
            )}
          </Stack>
        )}

        {mfa.screen === "setup" && mfa.setupData && (
          <Stack gap="md">
            <Text size="sm">
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
                  size="sm"
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
              <Button variant="default" onClick={mfa.cancelSetup}>
                Cancel
              </Button>
              <Button onClick={mfa.goToConfirm}>Continue</Button>
            </Group>
          </Stack>
        )}

        {mfa.screen === "confirm" && (
          <Stack gap="md">
            <Text size="sm">
              Enter the 6-digit code from your authenticator app to finish
              enabling MFA.
            </Text>
            <TextInput
              label="Authentication code"
              placeholder="123456"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={mfa.code}
              onChange={(event) => mfa.setCode(event.currentTarget.value)}
              disabled={mfa.isConfirming}
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={mfa.cancelSetup}>
                Cancel
              </Button>
              <Button
                onClick={mfa.confirmSetup}
                loading={mfa.isConfirming}
                disabled={mfa.code.trim().length === 0}
              >
                Confirm
              </Button>
            </Group>
          </Stack>
        )}
      </Stack>

      <OneTimeSecretModal
        opened={mfa.recoveryModal.opened}
        onClose={mfa.closeRecoveryModal}
        title="Your recovery codes"
        description="Store these somewhere safe — each code can be used once if you lose access to your authenticator."
        secrets={mfa.recoveryModal.codes}
      />
    </Card>
  );
}

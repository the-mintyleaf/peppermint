"use client";

import { useState } from "react";
import {
  Button,
  CopyButton,
  Group,
  PinInput,
  Stack,
  Text,
  notifications,
  useMutation,
} from "@peppermint/ui";
import {
  FormWrapper,
  useFormInstance,
  useFormControls,
} from "@peppermint/admin";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { CopyIcon } from "@phosphor-icons/react/dist/csr/Copy";
import { z } from "zod";
import QRCode from "react-qr-code";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { enrollMfa, verifyMfa } from "./mfa.api";
import type { MfaEnrollment } from "../authenticate.types";
import type { MfaEnrollPanelProps } from "./MfaEnrollPanel.types";

interface VerifyValues extends Record<string, unknown> {
  code: string;
}

const schema = z.object({
  code: z.string().length(6, "Enter the 6-digit code"),
});

/**
 * Self-contained TOTP enrollment: start → show QR + secret → verify the current code.
 * Used both by the forced superadmin enrollment screen and the voluntary Security tab
 * (`authenticate/docs/INTEGRATION.md` §7 — `mfa/enroll` then `mfa/verify`).
 */
export function MfaEnrollPanel({
  onVerified,
  startLabel = "Set up authenticator app",
}: MfaEnrollPanelProps) {
  const [enrollment, setEnrollment] = useState<MfaEnrollment | null>(null);

  const enrollMutation = useMutation({
    mutationFn: enrollMfa,
    onSuccess: (data) => setEnrollment(data),
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Couldn't start enrollment",
        message: getApiErrorMessage(error),
      });
    },
  });

  if (!enrollment) {
    return (
      <Stack gap="sm" align="flex-start">
        <Text size="sm" c="dimmed">
          Protect this account with a time-based authenticator app (e.g. Google
          Authenticator, Authy, 1Password).
        </Text>
        <Button
          onClick={() => enrollMutation.mutate()}
          loading={enrollMutation.isPending}
        >
          {startLabel}
        </Button>
      </Stack>
    );
  }

  return (
    <FormWrapper<VerifyValues> initial={{ code: "" }} validation={[schema]}>
      <VerifyForm enrollment={enrollment} onVerified={onVerified} />
    </FormWrapper>
  );
}

function VerifyForm({
  enrollment,
  onVerified,
}: {
  enrollment: MfaEnrollment;
  onVerified: () => void;
}) {
  const { form } = useFormInstance<VerifyValues>();
  const { isLoading } = useFormControls();

  const verifyMutation = useMutation({
    mutationFn: verifyMfa,
    onSuccess: () => {
      notifications.show({
        color: "green",
        title: "Authenticator enabled",
        message: "MFA is now required on every sign-in.",
      });
      onVerified();
    },
    onError: (error) => {
      form.setFieldError("code", getApiErrorMessage(error));
    },
  });

  const handleSubmit = () => {
    const { hasErrors } = form.validate();
    if (hasErrors) return;
    verifyMutation.mutate(form.values.code);
  };

  return (
    <Stack gap="md" align="flex-start">
      <Text size="sm" c="dimmed">
        Scan this QR code with your authenticator app, then enter the current
        6-digit code below.
      </Text>

      <div style={{ background: "#fff", padding: 12, borderRadius: 8 }}>
        <QRCode value={enrollment.otpauth_url} size={160} />
      </div>

      <Group gap="xs" wrap="nowrap">
        <Text size="xs" ff="monospace" c="dimmed">
          {enrollment.secret}
        </Text>
        <CopyButton value={enrollment.secret}>
          {({ copied, copy }) => (
            <Button
              size="compact-xs"
              variant="subtle"
              color={copied ? "teal" : undefined}
              leftSection={
                copied ? (
                  <CheckIcon size={14} aria-hidden />
                ) : (
                  <CopyIcon size={14} aria-hidden />
                )
              }
              onClick={copy}
            >
              {copied ? "Copied" : "Copy secret"}
            </Button>
          )}
        </CopyButton>
      </Group>

      <PinInput
        length={6}
        type="number"
        aria-label="Authenticator code"
        value={form.values.code}
        onChange={(value) => form.setFieldValue("code", value)}
        error={Boolean(form.errors.code)}
      />
      {form.errors.code ? (
        <Text size="xs" c="red">
          {form.errors.code}
        </Text>
      ) : null}

      <Button
        onClick={handleSubmit}
        loading={verifyMutation.isPending || isLoading}
      >
        Verify and enable
      </Button>
    </Stack>
  );
}

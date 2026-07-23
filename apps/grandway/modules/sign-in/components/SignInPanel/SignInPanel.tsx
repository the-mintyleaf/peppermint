"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Alert,
  Anchor,
  Button,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  modals,
  useMutation,
} from "@peppermint/ui";
import {
  FormWrapper,
  useFormInstance,
  useFormControls,
} from "@peppermint/admin";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { KeyIcon } from "@phosphor-icons/react/dist/csr/Key";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/csr/ShieldCheck";
import { z } from "zod";
import { getApiError, getApiErrorMessage } from "@/lib/authErrorMessages";
import { storeAuthTokens } from "@/lib/authTokens";
import { login } from "../../login.api";
import type { SignInFormValues } from "../../SignIn.types";
import type { SignInPanelProps } from "./SignInPanel.types";

const schema = z.object({
  username: z.string().min(1, "Required"),
  password: z.string().min(1, "Required"),
  otp_code: z.string(),
});

/**
 * The interactive body of the sign-in screen — error alert plus whichever form the
 * current phase calls for. Mirrors `@peppermint/admin`'s `SignInPanelContent` +
 * `SignInForm` + `MfaChallengeForm` styling (field sizes, icons, "Back to sign in"
 * link), wired to Grandway's own login contract instead of that shared primitive's.
 */
export function SignInPanel({ phase, onPhaseChange }: SignInPanelProps) {
  return (
    <FormWrapper<SignInFormValues>
      initial={{ username: "", password: "", otp_code: "" }}
      validation={[schema]}
    >
      <Fields phase={phase} onPhaseChange={onPhaseChange} />
    </FormWrapper>
  );
}

function Fields({ phase, onPhaseChange }: SignInPanelProps) {
  const router = useRouter();
  const { form } = useFormInstance<SignInFormValues>();
  const { isLoading } = useFormControls();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setErrorMessage(null);
      storeAuthTokens(data.access, data.refresh);
      onPhaseChange("redirecting");
      const destination = data.must_change_password
        ? "/password-change"
        : data.mfa_enrollment_required
          ? "/mfa-enroll"
          : "/admin";
      setTimeout(() => router.push(destination), 600);
    },
    onError: (error) => {
      const apiError = getApiError(error);
      if (apiError.code === "AUTH_MFA_REQUIRED") {
        onPhaseChange("mfa");
        setErrorMessage(null);
        return;
      }
      if (apiError.code === "AUTH_DEVICE_LIMIT_REACHED") {
        modals.open({
          title: "Too many devices signed in",
          children: (
            <Text size="sm">
              You&apos;re signed in on the maximum of 3 devices. Sign out on
              another device, or sign back in on a device you&apos;ve already
              used.
            </Text>
          ),
        });
        return;
      }
      setErrorMessage(getApiErrorMessage(error));
    },
  });

  const handleSubmit = () => {
    const { hasErrors } = form.validate();
    if (hasErrors) return;
    if (phase === "mfa" && form.values.otp_code.trim().length === 0) {
      form.setFieldError("otp_code", "Code is required");
      return;
    }
    mutation.mutate({
      username: form.values.username,
      password: form.values.password,
      otp_code: phase === "mfa" ? form.values.otp_code : undefined,
    });
  };

  const busy = mutation.isPending || isLoading;

  return (
    <Stack gap="xs" py="md">
      {errorMessage ? (
        <Alert
          role="alert"
          aria-live="assertive"
          color="red"
          icon={<WarningIcon size={18} weight="fill" aria-hidden />}
        >
          {errorMessage}
        </Alert>
      ) : null}

      {phase === "mfa" ? (
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Enter the current 6-digit code from your authenticator app.
          </Text>
          <TextInput
            size="md"
            placeholder="123456"
            required
            autoFocus
            disabled={busy}
            {...form.getInputProps("otp_code")}
            leftSection={
              <ShieldCheckIcon
                size={16}
                weight="fill"
                style={{ opacity: 0.5 }}
                aria-hidden
              />
            }
          />
          <Button
            onClick={handleSubmit}
            loading={busy}
            fullWidth
            size="md"
            color="brand"
          >
            Verify
          </Button>
          <Anchor
            component="button"
            type="button"
            size="xs"
            c="dimmed"
            onClick={() => {
              onPhaseChange("credentials");
              form.setFieldValue("otp_code", "");
            }}
          >
            Back to sign in
          </Anchor>
        </Stack>
      ) : (
        <Stack gap="md">
          <TextInput
            size="md"
            placeholder="Username"
            required
            autoComplete="username"
            disabled={busy}
            {...form.getInputProps("username")}
            leftSection={
              <UserIcon
                size={16}
                weight="fill"
                style={{ opacity: 0.5 }}
                aria-hidden
              />
            }
          />
          <PasswordInput
            size="md"
            placeholder="Password"
            required
            autoComplete="current-password"
            disabled={busy}
            {...form.getInputProps("password")}
            leftSection={
              <KeyIcon
                size={16}
                weight="fill"
                style={{ opacity: 0.5 }}
                aria-hidden
              />
            }
          />
          <Button
            onClick={handleSubmit}
            loading={busy}
            fullWidth
            size="md"
            color="brand"
          >
            Sign in
          </Button>
        </Stack>
      )}
    </Stack>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Center,
  Loader,
  Paper,
  PasswordInput,
  Stack,
  Text,
  Title,
  notifications,
  useMutation,
} from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import { z } from "zod";
import { FIRST_LOGIN_CHALLENGE_KEY } from "@/modules/sign-in";
import {
  PasswordStrengthMeter,
  firstLoginChangePassword,
  newPasswordSchema,
  resolvePasswordError,
} from "@/modules/admin/authenticate/_shared/password";

interface FirstLoginValues extends Record<string, unknown> {
  new_password: string;
  new_password_confirm: string;
}

const schema = z
  .object({
    new_password: newPasswordSchema,
    new_password_confirm: z.string().min(1, "Required"),
  })
  .refine((v) => v.new_password === v.new_password_confirm, {
    path: ["new_password_confirm"],
    message: "Passwords do not match",
  });

/**
 * Forced first-login password change. Reached from sign-in when the login response is a
 * challenge (no session). Reads the one-time challenge token stashed by the sign-in page;
 * with no challenge present there is nothing to change, so we return to sign-in.
 */
export function ModulePasswordChange() {
  // `null` = still checking (SSR/first paint); a string = the resolved challenge.
  const [challenge, setChallenge] = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem(FIRST_LOGIN_CHALLENGE_KEY);
    if (!token) {
      window.location.href = "/";
      return;
    }
    // Legitimate post-mount sync of a browser-only value; the first render
    // intentionally shows the loader until the challenge is read.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChallenge(token);
  }, []);

  if (!challenge) {
    return (
      <Center mih="100vh">
        <Loader size="sm" />
      </Center>
    );
  }

  return (
    <Center mih="100vh" p="md">
      <Paper withBorder p="xl" radius="md" maw={420} w="100%">
        <Stack gap="lg">
          <Stack gap={4}>
            <Title order={2}>Set a new password</Title>
            <Text size="sm" c="dimmed">
              Your account requires a new password before you can sign in.
            </Text>
          </Stack>

          <FormWrapper<FirstLoginValues>
            initial={{ new_password: "", new_password_confirm: "" }}
            validation={[schema]}
          >
            <Stack gap="md">
              <Fields />
              <SubmitButton challenge={challenge} />
            </Stack>
          </FormWrapper>
        </Stack>
      </Paper>
    </Center>
  );
}

function Fields() {
  const { form } = useFormInstance<FirstLoginValues>();
  return (
    <>
      <PasswordInput
        label="New password"
        required
        {...form.getInputProps("new_password")}
      />
      <PasswordStrengthMeter password={form.values.new_password} />
      <PasswordInput
        label="Confirm new password"
        required
        {...form.getInputProps("new_password_confirm")}
      />
    </>
  );
}

function SubmitButton({ challenge }: { challenge: string }) {
  const { form } = useFormInstance<FirstLoginValues>();
  const { isLoading } = useFormControls();

  const mutation = useMutation({
    mutationFn: firstLoginChangePassword,
    onSuccess: () => {
      sessionStorage.removeItem(FIRST_LOGIN_CHALLENGE_KEY);
      notifications.show({
        color: "green",
        title: "Password set",
        message: "You can now sign in with your new password.",
      });
      window.location.href = "/";
    },
    onError: (error) => {
      const resolved = resolvePasswordError(error);
      if (resolved.challengeInvalid) {
        sessionStorage.removeItem(FIRST_LOGIN_CHALLENGE_KEY);
        notifications.show({
          color: "red",
          title: "Session expired",
          message: resolved.message,
        });
        window.location.href = "/";
        return;
      }
      if (resolved.field && resolved.field !== "current_password") {
        form.setFieldError(resolved.field, resolved.message);
        return;
      }
      notifications.show({
        color: "red",
        title: "Couldn't set password",
        message: resolved.message,
      });
    },
  });

  const handleSubmit = () => {
    const { hasErrors } = form.validate();
    if (hasErrors) return;
    mutation.mutate({
      challenge_token: challenge,
      new_password: form.values.new_password,
      new_password_confirm: form.values.new_password_confirm,
    });
  };

  return (
    <Button
      loading={mutation.isPending || isLoading}
      onClick={handleSubmit}
      fullWidth
    >
      Set password and continue
    </Button>
  );
}
